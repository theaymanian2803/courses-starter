import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Use sandbox for testing, change to api-m.paypal.com for production
const PAYPAL_API_URL = "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get("PAYPAL_CLIENT_ID");
  const clientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials not configured");
  }

  const auth = btoa(`${clientId}:${clientSecret}`);
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${JSON.stringify(data)}`);
  }

  return data.access_token;
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

    const accessToken = await getPayPalAccessToken();

    // Capture the PayPal order
    const captureResponse = await fetch(`${PAYPAL_API_URL}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    const captureData = await captureResponse.json();
    if (!captureResponse.ok) {
      throw new Error(`PayPal capture failed: ${JSON.stringify(captureData)}`);
    }

    if (captureData.status === "COMPLETED") {
      // Extract user and course info from custom_id
      const purchaseUnit = captureData.purchase_units?.[0];
      const payments = purchaseUnit?.payments?.captures?.[0];
      
      let userId: string | null = null;
      let courseId: string | null = null;
      
      try {
        const customData = JSON.parse(purchaseUnit?.custom_id || "{}");
        userId = customData.user_id;
        courseId = customData.course_id;
      } catch {
        console.error("Failed to parse custom_id");
      }

      if (userId && courseId) {
        // Grant course access
        const { error: purchaseError } = await supabaseAdmin
          .from("purchases")
          .insert({
            user_id: userId,
            course_id: courseId,
          });

        if (purchaseError) {
          console.error("Failed to insert purchase:", purchaseError);
        }
      }

      return new Response(JSON.stringify({ 
        success: true,
        status: captureData.status,
        transactionId: payments?.id,
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
