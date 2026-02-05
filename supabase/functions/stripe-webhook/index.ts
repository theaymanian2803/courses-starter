 import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
 import Stripe from "https://esm.sh/stripe@18.5.0";
 import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
 
 const corsHeaders = {
   "Access-Control-Allow-Origin": "*",
   "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
 };
 
 serve(async (req) => {
   if (req.method === "OPTIONS") {
     return new Response(null, { headers: corsHeaders });
   }
 
   const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
     apiVersion: "2025-08-27.basil",
   });
 
   const supabaseAdmin = createClient(
     Deno.env.get("SUPABASE_URL") ?? "",
     Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
   );
 
   try {
     const body = await req.text();
     const signature = req.headers.get("stripe-signature");
     const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
 
     let event: Stripe.Event;
 
     if (webhookSecret && signature) {
       event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
     } else {
       // For testing without webhook signature verification
       event = JSON.parse(body);
     }
 
     console.log("Processing webhook event:", event.type);
 
     if (event.type === "checkout.session.completed") {
       const session = event.data.object as Stripe.Checkout.Session;
       
       const userId = session.metadata?.user_id;
       const courseId = session.metadata?.course_id;
 
       if (userId && courseId) {
         // Check if purchase already exists
         const { data: existingPurchase } = await supabaseAdmin
           .from("purchases")
           .select("id")
           .eq("user_id", userId)
           .eq("course_id", courseId)
           .maybeSingle();
 
         if (!existingPurchase) {
           // Grant course access by inserting into purchases
           const { error: insertError } = await supabaseAdmin
             .from("purchases")
             .insert({
               user_id: userId,
               course_id: courseId,
             });
 
           if (insertError) {
             console.error("Error inserting purchase:", insertError);
             throw new Error(`Failed to grant course access: ${insertError.message}`);
           }
 
           console.log(`Course access granted for user ${userId} to course ${courseId}`);
         } else {
           console.log("Purchase already exists, skipping insert");
         }
       } else {
         console.error("Missing user_id or course_id in session metadata");
       }
     }
 
     return new Response(JSON.stringify({ received: true }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
       status: 200,
     });
   } catch (error) {
     console.error("Webhook error:", error);
     const errorMessage = error instanceof Error ? error.message : "Unknown error";
     return new Response(JSON.stringify({ error: errorMessage }), {
       headers: { ...corsHeaders, "Content-Type": "application/json" },
       status: 400,
     });
   }
 });