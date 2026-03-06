import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAYPAL_BASES = ["https://api-m.sandbox.paypal.com", "https://api-m.paypal.com"];

type PayPalTokenResult = {
  accessToken: string;
  apiBase: string;
};

function getPayPalApiBases(): string[] {
  const configuredBase = Deno.env.get("PAYPAL_API_BASE_URL")?.trim();
  const allBases = [configuredBase, ...PAYPAL_BASES]
    .filter((base): base is string => Boolean(base))
    .map((base) => base.replace(/\/+$/, ""));

  return [...new Set(allBases)];
}

async function requestPayPalAccessToken(apiBase: string, clientId: string, clientSecret: string): Promise<string> {
  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(`${apiBase}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
      "Accept-Language": "en_US",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString(),
  });

  const responseText = await response.text();
  let parsed: Record<string, unknown> | null = null;

  try {
    parsed = responseText ? JSON.parse(responseText) : null;
  } catch {
    parsed = null;
  }

  if (!response.ok || !parsed || typeof parsed.access_token !== "string") {
    const detail = parsed ? JSON.stringify(parsed) : (responseText || "empty response");
    throw new Error(`status ${response.status}: ${detail.slice(0, 300)}`);
  }

  return parsed.access_token;
}

async function getPayPalAccessToken(): Promise<PayPalTokenResult> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID")?.trim();
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET")?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const errors: string[] = [];

  for (const apiBase of getPayPalApiBases()) {
    try {
      const accessToken = await requestPayPalAccessToken(apiBase, clientId, clientSecret);
      return { accessToken, apiBase };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${apiBase} -> ${message}`);
    }
  }

  throw new Error(`PayPal auth failed in all environments: ${errors.join(" | ")}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    // Use anon client with user token for auth
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user?.email) {
      throw new Error("User not authenticated or email not available");
    }

    const { courseId, couponCode, bumpOfferIds, returnUrl, cancelUrl } = await req.json();
    if (!courseId) {
      throw new Error("Course ID is required");
    }

    // Use service role client for DB reads (bypasses RLS cleanly)
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch the course
    const { data: course, error: courseError } = await supabaseAdmin
      .from("courses")
      .select("title, price")
      .eq("id", courseId)
      .single();

    if (courseError || !course) {
      throw new Error("Course not found");
    }

    let finalPrice = course.price;
    let description = `${course.title} - Lifetime Access`;

    // Validate and apply coupon if provided
    if (couponCode) {
      const { data: coupon } = await supabaseAdmin
        .from("coupons")
        .select("*")
        .eq("code", couponCode.toUpperCase().trim())
        .eq("is_active", true)
        .maybeSingle();

      if (coupon) {
        const notExpired = !coupon.expires_at || new Date(coupon.expires_at) > new Date();
        const notMaxed = !coupon.max_uses || coupon.current_uses < coupon.max_uses;
        if (notExpired && notMaxed) {
          finalPrice = Math.round(finalPrice * (1 - coupon.discount_percent / 100) * 100) / 100;
          description += ` (${coupon.discount_percent}% off with ${coupon.code})`;
        }
      }
    }

    // Add order bump prices if any
    if (bumpOfferIds && Array.isArray(bumpOfferIds) && bumpOfferIds.length > 0) {
      const { data: bumps } = await supabaseAdmin
        .from("upsell_offers")
        .select("id, title, price")
        .in("id", bumpOfferIds)
        .eq("is_active", true)
        .eq("offer_type", "order_bump");

      if (bumps && bumps.length > 0) {
        const bumpTotal = bumps.reduce((sum: number, bump: { price: number }) => sum + bump.price, 0);
        finalPrice = Math.round((finalPrice + bumpTotal) * 100) / 100;
        const bumpNames = bumps.map((bump: { title: string }) => bump.title).join(", ");
        description += ` + ${bumpNames}`;
      }
    }

    if (finalPrice <= 0) {
      throw new Error("Invalid total price");
    }

    const { accessToken, apiBase } = await getPayPalAccessToken();

    const orderResponse = await fetch(`${apiBase}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: "USD",
              value: finalPrice.toFixed(2),
            },
            description: description.substring(0, 127),
            custom_id: JSON.stringify({
              user_id: user.id,
              course_id: courseId,
              coupon_code: couponCode || null,
              bump_offer_ids: bumpOfferIds || [],
            }),
          },
        ],
        application_context: {
          brand_name: "Unc Code Academy",
          landing_page: "BILLING",
          user_action: "PAY_NOW",
          return_url: returnUrl || `${req.headers.get("origin")}/payment-success`,
          cancel_url: cancelUrl || `${req.headers.get("origin")}/course/${courseId}`,
        },
      }),
    });

    const orderData = await orderResponse.json();
    if (!orderResponse.ok) {
      console.error("PayPal order creation failed:", JSON.stringify(orderData));
      throw new Error(`PayPal order creation failed: ${orderData.message || JSON.stringify(orderData)}`);
    }

    const approvalLink = orderData.links?.find((link: { rel: string }) => link.rel === "approve");
    if (!approvalLink) {
      throw new Error("No approval URL found in PayPal response");
    }

    return new Response(JSON.stringify({
      orderId: orderData.id,
      approvalUrl: approvalLink.href,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("PayPal order error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
