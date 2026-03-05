import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Crown, Zap, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

type Tier = {
  id: string; name: string; slug: string; description: string | null;
  monthly_price: number; yearly_price: number; features: any;
  is_active: boolean; sort_order: number;
};

const tierIcons: Record<string, typeof Star> = {
  basic: Star,
  pro: Zap,
  elite: Crown,
};

export const SubscriptionPricing = () => {
  const navigate = useNavigate();
  const [isYearly, setIsYearly] = useState(false);

  const { data: tiers } = useQuery({
    queryKey: ["subscriptionTiers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subscription_tiers")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Tier[];
    },
  });

  if (!tiers || tiers.length === 0) return null;

  const middleIndex = Math.floor(tiers.length / 2);

  return (
    <section className="py-24 bg-muted/30 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/3 rounded-full blur-3xl" />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <Badge variant="outline" className="mb-4">Subscriptions</Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-primary">Membership</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Unlock courses and exclusive content with a monthly or yearly plan
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 rounded-full bg-muted border border-border">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                !isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                isYearly ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <Badge className="ml-2 bg-primary/20 text-primary border-0 text-[10px]">Save 20%</Badge>
            </button>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier, index) => {
            const isPopular = index === middleIndex;
            const Icon = tierIcons[tier.slug] || Star;
            const price = isYearly ? tier.yearly_price : tier.monthly_price;
            const features = Array.isArray(tier.features) ? tier.features : [];

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`rounded-2xl p-8 border relative ${
                  isPopular
                    ? "border-primary/30 bg-card box-glow scale-[1.02]"
                    : "border-border/50 bg-card"
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1">
                      Most Popular
                    </Badge>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`w-12 h-12 rounded-xl mx-auto mb-3 flex items-center justify-center ${
                    isPopular ? "bg-primary/20" : "bg-muted"
                  }`}>
                    <Icon className={`h-6 w-6 ${isPopular ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                  {tier.description && (
                    <p className="text-sm text-muted-foreground mt-1">{tier.description}</p>
                  )}
                </div>

                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">${price}</span>
                    <span className="text-muted-foreground">/{isYearly ? "year" : "month"}</span>
                  </div>
                  {isYearly && (
                    <p className="text-xs text-primary mt-1">
                      ${(tier.yearly_price / 12).toFixed(2)}/mo billed yearly
                    </p>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {features.map((feature: string, fi: number) => (
                    <li key={fi} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  className={`w-full ${isPopular ? "box-glow" : ""}`}
                  variant={isPopular ? "default" : "outline"}
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
