import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles } from "lucide-react";

interface OrderBumpProps {
  selectedOfferIds: string[];
  onToggle: (offerId: string, price: number) => void;
}

type UpsellOffer = {
  id: string; title: string; description: string | null; price: number;
};

export const OrderBump = ({ selectedOfferIds, onToggle }: OrderBumpProps) => {
  const { data: offers } = useQuery({
    queryKey: ["orderBumpOffers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("upsell_offers")
        .select("id, title, description, price")
        .eq("offer_type", "order_bump")
        .eq("is_active", true);
      if (error) throw error;
      return data as UpsellOffer[];
    },
  });

  if (!offers || offers.length === 0) return null;

  return (
    <div className="space-y-3">
      {offers.map((offer) => (
        <label
          key={offer.id}
          className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            selectedOfferIds.includes(offer.id)
              ? "border-primary bg-primary/5 box-glow-sm"
              : "border-border hover:border-primary/30"
          }`}
        >
          <Checkbox
            checked={selectedOfferIds.includes(offer.id)}
            onCheckedChange={() => onToggle(offer.id, offer.price)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-semibold text-foreground text-sm">{offer.title}</span>
            </div>
            {offer.description && (
              <p className="text-xs text-muted-foreground mb-1">{offer.description}</p>
            )}
            <span className="text-primary font-bold text-sm">+${offer.price}</span>
          </div>
        </label>
      ))}
    </div>
  );
};
