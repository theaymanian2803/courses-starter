import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Loader2, Copy, Check, CreditCard, Building2, Tag, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentOptionsProps {
  onSuccess?: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
  basePrice?: number;
}

const BUNDLE_PRICE = 130;

export const PaymentOptions = ({ 
  onSuccess, 
  isLoggedIn, 
  onLoginRequired,
  basePrice = BUNDLE_PRICE,
}: PaymentOptionsProps) => {
  const [isPayPalLoading, setIsPayPalLoading] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);
  const [isCouponLoading, setIsCouponLoading] = useState(false);

  const discountedPrice = appliedCoupon
    ? Math.round(basePrice * (1 - appliedCoupon.discount_percent / 100) * 100) / 100
    : basePrice;

  const bankDetails = {
    bankName: "Your Bank Name",
    accountName: "Unc Code Academy",
    iban: "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
    bic: "XXXXXXXX",
    amount: `$${discountedPrice} USD`,
    reference: "UCA-BUNDLE",
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsCouponLoading(true);
    try {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("Invalid coupon code");
        return;
      }
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        toast.error("This coupon has expired");
        return;
      }
      if (data.max_uses && data.current_uses >= data.max_uses) {
        toast.error("This coupon has reached its usage limit");
        return;
      }

      setAppliedCoupon({ code: data.code, discount_percent: data.discount_percent });
      toast.success(`Coupon applied! ${data.discount_percent}% off`);
    } catch (err: any) {
      toast.error("Failed to validate coupon");
    } finally {
      setIsCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
  };

  const handlePayPalPayment = async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    setIsPayPalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-paypal-order", {
        body: {
          courseId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
          couponCode: appliedCoupon?.code,
        },
      });

      if (error) throw error;

      if (data?.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error("No approval URL returned");
      }
    } catch (error: any) {
      console.error("PayPal error:", error);
      toast.error(error.message || "Failed to start PayPal checkout");
    } finally {
      setIsPayPalLoading(false);
    }
  };

  const handleBankTransfer = () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }
    setShowBankDetails(true);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast.success("Copied to clipboard");
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  return (
    <>
      <div className="space-y-3">
        {/* Coupon Input */}
        {appliedCoupon ? (
          <div className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground">
                {appliedCoupon.code} — {appliedCoupon.discount_percent}% off
              </span>
            </div>
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={removeCoupon}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Input
              placeholder="Coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
              className="flex-1"
            />
            <Button
              variant="outline"
              onClick={handleApplyCoupon}
              disabled={isCouponLoading || !couponCode.trim()}
            >
              {isCouponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
            </Button>
          </div>
        )}

        {/* Show discounted price */}
        {appliedCoupon && (
          <p className="text-center text-sm text-muted-foreground">
            New total: <span className="text-primary font-bold">${discountedPrice}</span>{" "}
            <span className="line-through">${basePrice}</span>
          </p>
        )}

        {/* PayPal Button */}
        <Button
          size="lg"
          className="w-full text-lg py-6 box-glow bg-[#0070BA] hover:bg-[#005ea6]"
          onClick={handlePayPalPayment}
          disabled={isPayPalLoading}
        >
          {isPayPalLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <CreditCard className="mr-2 h-5 w-5" />
              Pay with PayPal
            </>
          )}
        </Button>

        {/* Bank Transfer Button */}
        <Button
          size="lg"
          variant="outline"
          className="w-full text-lg py-6"
          onClick={handleBankTransfer}
        >
          <Building2 className="mr-2 h-5 w-5" />
          Bank Transfer (RIB)
        </Button>
      </div>

      {/* Bank Details Dialog */}
      <Dialog open={showBankDetails} onOpenChange={setShowBankDetails}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Bank Transfer Details</DialogTitle>
            <DialogDescription>
              Use these details to complete your payment via bank transfer. 
              After payment, contact us with your payment confirmation to activate your access.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="rounded-lg bg-muted/50 p-4 space-y-3">
              <BankDetailRow 
                label="Bank Name" 
                value={bankDetails.bankName}
                onCopy={() => copyToClipboard(bankDetails.bankName, "bankName")}
                isCopied={copiedField === "bankName"}
              />
              <BankDetailRow 
                label="Account Name" 
                value={bankDetails.accountName}
                onCopy={() => copyToClipboard(bankDetails.accountName, "accountName")}
                isCopied={copiedField === "accountName"}
              />
              <BankDetailRow 
                label="IBAN" 
                value={bankDetails.iban}
                onCopy={() => copyToClipboard(bankDetails.iban.replace(/\s/g, ""), "iban")}
                isCopied={copiedField === "iban"}
              />
              <BankDetailRow 
                label="BIC/SWIFT" 
                value={bankDetails.bic}
                onCopy={() => copyToClipboard(bankDetails.bic, "bic")}
                isCopied={copiedField === "bic"}
              />
              <div className="pt-2 border-t border-border">
                <BankDetailRow 
                  label="Amount" 
                  value={bankDetails.amount}
                  onCopy={() => copyToClipboard(String(discountedPrice), "amount")}
                  isCopied={copiedField === "amount"}
                  highlight
                />
                <BankDetailRow 
                  label="Reference" 
                  value={bankDetails.reference}
                  onCopy={() => copyToClipboard(bankDetails.reference, "reference")}
                  isCopied={copiedField === "reference"}
                  highlight
                />
              </div>
            </div>

            <div className="text-sm text-muted-foreground bg-primary/5 rounded-lg p-3 border border-primary/10">
              <p className="font-medium text-foreground mb-1">Important:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Include the reference in your transfer</li>
                <li>Send payment confirmation to verify your purchase</li>
                <li>Access will be granted within 24-48 hours</li>
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

interface BankDetailRowProps {
  label: string;
  value: string;
  onCopy: () => void;
  isCopied: boolean;
  highlight?: boolean;
}

const BankDetailRow = ({ label, value, onCopy, isCopied, highlight }: BankDetailRowProps) => (
  <div className={cn(
    "flex items-center justify-between gap-2",
    highlight && "font-medium"
  )}>
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={cn("text-sm", highlight && "text-primary")}>{value}</p>
    </div>
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 shrink-0"
      onClick={onCopy}
    >
      <AnimatePresence mode="wait">
        {isCopied ? (
          <motion.div
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Check className="h-4 w-4 text-primary" />
          </motion.div>
        ) : (
          <motion.div
            key="copy"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            <Copy className="h-4 w-4" />
          </motion.div>
        )}
      </AnimatePresence>
    </Button>
  </div>
);
