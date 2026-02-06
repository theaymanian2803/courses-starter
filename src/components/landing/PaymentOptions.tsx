import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Loader2, Copy, Check, CreditCard, Building2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PaymentOptionsProps {
  onSuccess?: () => void;
  isLoggedIn: boolean;
  onLoginRequired: () => void;
}

const BANK_DETAILS = {
  bankName: "Your Bank Name",
  accountName: "Unc Code Academy",
  iban: "FR76 XXXX XXXX XXXX XXXX XXXX XXX",
  bic: "XXXXXXXX",
  amount: "$199 USD",
  reference: "UCA-MERN-COURSE",
};

export const PaymentOptions = ({ 
  onSuccess, 
  isLoggedIn, 
  onLoginRequired 
}: PaymentOptionsProps) => {
  const [isPayPalLoading, setIsPayPalLoading] = useState(false);
  const [showBankDetails, setShowBankDetails] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handlePayPalPayment = async () => {
    if (!isLoggedIn) {
      onLoginRequired();
      return;
    }

    setIsPayPalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-paypal-order", {
        body: { courseId: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
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
                value={BANK_DETAILS.bankName}
                onCopy={() => copyToClipboard(BANK_DETAILS.bankName, "bankName")}
                isCopied={copiedField === "bankName"}
              />
              <BankDetailRow 
                label="Account Name" 
                value={BANK_DETAILS.accountName}
                onCopy={() => copyToClipboard(BANK_DETAILS.accountName, "accountName")}
                isCopied={copiedField === "accountName"}
              />
              <BankDetailRow 
                label="IBAN" 
                value={BANK_DETAILS.iban}
                onCopy={() => copyToClipboard(BANK_DETAILS.iban.replace(/\s/g, ""), "iban")}
                isCopied={copiedField === "iban"}
              />
              <BankDetailRow 
                label="BIC/SWIFT" 
                value={BANK_DETAILS.bic}
                onCopy={() => copyToClipboard(BANK_DETAILS.bic, "bic")}
                isCopied={copiedField === "bic"}
              />
              <div className="pt-2 border-t border-border">
                <BankDetailRow 
                  label="Amount" 
                  value={BANK_DETAILS.amount}
                  onCopy={() => copyToClipboard("199", "amount")}
                  isCopied={copiedField === "amount"}
                  highlight
                />
                <BankDetailRow 
                  label="Reference" 
                  value={BANK_DETAILS.reference}
                  onCopy={() => copyToClipboard(BANK_DETAILS.reference, "reference")}
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
            <Check className="h-4 w-4 text-success" />
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
