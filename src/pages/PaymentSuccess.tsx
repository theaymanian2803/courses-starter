import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { PostPurchaseUpsell } from "@/components/checkout/PostPurchaseUpsell";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [showUpsell, setShowUpsell] = useState(false);

  useEffect(() => {
    const capturePayment = async () => {
      const token = searchParams.get("token");
      if (!token) {
        setStatus("error");
        return;
      }

      // Get user ID
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id ?? null);

      try {
        const { data, error } = await supabase.functions.invoke("capture-paypal-order", {
          body: { orderId: token },
        });

        if (error) throw error;

        if (data?.success) {
          setStatus("success");
          toast.success("Payment successful! You now have full course access.");
          // Show upsell modal after successful payment
          if (session?.user?.id) {
            setShowUpsell(true);
          }
        } else {
          throw new Error(data?.error || "Payment capture failed");
        }
      } catch (err: any) {
        console.error("Payment capture error:", err);
        setStatus("error");
        toast.error(err.message || "Payment verification failed");
      }
    };

    capturePayment();
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-6">
        {status === "loading" && (
          <>
            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Processing Payment...</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
          </>
        )}

        {status === "success" && (
          <>
            <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Payment Successful!</h1>
            <p className="text-muted-foreground">
              You now have full access to the course. Start learning now!
            </p>
            <Button onClick={() => navigate("/dashboard")} className="w-full" size="lg">
              Go to Dashboard
            </Button>
          </>
        )}

        {status === "error" && (
          <>
            <XCircle className="h-16 w-16 text-destructive mx-auto" />
            <h1 className="text-2xl font-bold text-foreground">Payment Failed</h1>
            <p className="text-muted-foreground">
              Something went wrong with your payment. Please try again.
            </p>
            <Button onClick={() => navigate("/")} variant="outline" className="w-full" size="lg">
              Back to Home
            </Button>
          </>
        )}
      </div>

      {/* Post-Purchase Upsell Modal */}
      {userId && (
        <PostPurchaseUpsell
          open={showUpsell}
          onClose={() => setShowUpsell(false)}
          userId={userId}
        />
      )}
    </div>
  );
}
