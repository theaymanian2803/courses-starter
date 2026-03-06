import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const PAYPAL_BASES = ["https://api-m.sandbox.paypal.com", "https://api-m.paypal.com"];

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

async function capturePayPalOrder(orderId: string) {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID")?.trim();
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET")?.trim();

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const errors: string[] = [];

  for (const apiBase of getPayPalApiBases()) {
    try {
      const accessToken = await requestPayPalAccessToken(apiBase, clientId, clientSecret);

      const captureResponse = await fetch(`${apiBase}/v2/checkout/orders/${orderId}/capture`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const responseText = await captureResponse.text();
      let captureData: Record<string, unknown> | null = null;

      try {
        captureData = responseText ? JSON.parse(responseText) : null;
      } catch {
        captureData = null;
      }

      if (!captureResponse.ok || !captureData) {
        const detail = captureData ? JSON.stringify(captureData) : (responseText || "empty response");
        errors.push(`${apiBase} -> status ${captureResponse.status}: ${detail.slice(0, 300)}`);
        continue;
      }

      return captureData;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      errors.push(`${apiBase} -> ${message}`);
    }
  }

  throw new Error(`PayPal capture failed in all environments: ${errors.join(" | ")}`);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      throw new Error("Order ID is required");
    }

    const captureData = await capturePayPalOrder(orderId);

    if (captureData.status === "COMPLETED") {
      const purchaseUnit = (captureData.purchase_units as Array<Record<string, unknown>>)?.[0];
      const payments = (purchaseUnit?.payments as Record<string, unknown>)?.captures as Array<Record<string, unknown>> | undefined;
      const firstPayment = payments?.[0];

      let userId: string | null = null;
      let courseId: string | null = null;
      let couponCode: string | null = null;
      let bumpOfferIds: string[] = [];

      try {
        const customIdRaw = purchaseUnit?.custom_id;
        const customData = JSON.parse(typeof customIdRaw === "string" ? customIdRaw : "{}");
        userId = customData.user_id ?? null;
        courseId = customData.course_id ?? null;
        couponCode = customData.coupon_code ?? null;
        bumpOfferIds = Array.isArray(customData.bump_offer_ids) ? customData.bump_offer_ids : [];
      } catch {
        console.error("Failed to parse custom_id");
      }

      if (userId && courseId) {
        const { error: purchaseError } = await supabaseAdmin
          .from("purchases")
          .insert({
            user_id: userId,
            course_id: courseId,
          });

        if (purchaseError) {
          console.error("Failed to insert purchase:", purchaseError);
        }

        if (bumpOfferIds.length > 0) {
          const bumpInserts = bumpOfferIds.map((offerId: string) => ({
            user_id: userId!,
            upsell_offer_id: offerId,
          }));
          const { error: bumpError } = await supabaseAdmin
            .from("upsell_purchases")
            .insert(bumpInserts);
          if (bumpError) {
            console.error("Failed to insert bump purchases:", bumpError);
          }
        }

        if (couponCode) {
          await supabaseAdmin.rpc("increment_coupon_usage", { _code: couponCode }).catch((err: Error) => {
            console.error("Failed to increment coupon usage:", err);
          });
        }
      }

      return new Response(JSON.stringify({
        success: true,
        status: captureData.status,
        transactionId: firstPayment?.id,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    return new Response(JSON.stringify({
      success: false,
      status: captureData.status,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  } catch (error) {
    console.error("PayPal capture error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
