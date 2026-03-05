import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface PostPurchaseUpsellProps {
  open: boolean;
  onClose: () => void;
  userId: string;
}

export const PostPurchaseUpsell = ({ open, onClose, userId }: PostPurchaseUpsellProps) => {
  const [purchasing, setPurchasing] = useState(false);

  const { data: offers } = useQuery({
    queryKey: ["postPurchaseOffers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upsell_offers")
        .select("*")
        .eq("offer_type", "post_purchase")
        .eq("is_active", true)
        .limit(1);
      if (error) throw error;
      return data;
    },
  });

  const offer = offers?.[0];

  const handleAccept = async () => {
    if (!offer) return;
    setPurchasing(true);
    try {
      const { error } = await supabase.from("upsell_purchases").insert({
        user_id: userId,
        upsell_offer_id: offer.id,
      });
      if (error) throw error;
      toast.success("Upsell added to your account!");
      onClose();
    } catch (err: any) {
      toast.error("Failed to process. Please try again.");
    } finally {
      setPurchasing(false);
    }
  };

  if (!offer) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            Wait! Special One-Time Offer
          </DialogTitle>
          <DialogDescription>
            This exclusive deal is only available right now
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4 py-2"
        >
          <div className="rounded-xl bg-primary/5 border border-primary/20 p-6 text-center">
            <h3 className="text-lg font-bold text-foreground mb-2">{offer.title}</h3>
            {offer.description && (
              <p className="text-sm text-muted-foreground mb-4">{offer.description}</p>
            )}
            <div className="text-3xl font-bold text-primary">${offer.price}</div>
            <p className="text-xs text-muted-foreground mt-1">One-time payment</p>
          </div>

          <Button
            size="lg"
            className="w-full text-lg py-6 box-glow"
            onClick={handleAccept}
            disabled={purchasing}
          >
            {purchasing ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5 mr-2" />
            )}
            Yes, Add This To My Order!
          </Button>

          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={onClose}
          >
            No thanks, I'll skip this offer
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
