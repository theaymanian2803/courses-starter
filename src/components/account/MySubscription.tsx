import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { CreditCard, Calendar, Clock, Star, Settings, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { toast } from "sonner";

export function MySubscription({ userId }: { userId: string }) {
  const [isPortalLoading, setIsPortalLoading] = useState(false);

  const { data: subscription, isLoading } = useQuery({
    queryKey: ["userSubscription", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_subscriptions")
        .select("*, subscription_tiers(name, slug, description, monthly_price, yearly_price, features)")
        .eq("user_id", userId)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      } else {
        throw new Error("No portal URL returned");
      }
    } catch (err: any) {
      console.error("Portal error:", err);
      toast.error(err.message || "Failed to open subscription management portal");
    } finally {
      setIsPortalLoading(false);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-48 w-full rounded-xl" />;
  }

  if (!subscription) {
    return (
      <div className="text-center py-16">
        <CreditCard className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No active subscription</h3>
        <p className="text-muted-foreground mb-6">Subscribe to a plan to unlock premium courses and features.</p>
        <Button asChild>
          <Link to="/#pricing">View Plans</Link>
        </Button>
      </div>
    );
  }

  const tier = subscription.subscription_tiers as any;
  const features = (tier?.features || []) as string[];
  const price = subscription.billing_cycle === "yearly" ? tier?.yearly_price : tier?.monthly_price;

  return (
    <div className="space-y-6">
      <Card className="border-primary/30 bg-card">
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{tier?.name || "Subscription"}</h3>
                <p className="text-sm text-muted-foreground">{tier?.description}</p>
              </div>
            </div>
            <Badge className="text-sm">{subscription.status}</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Price:</span>
              <span className="font-semibold text-foreground">
                ${Number(price || 0).toFixed(2)}/{subscription.billing_cycle === "yearly" ? "yr" : "mo"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Started:</span>
              <span className="font-semibold text-foreground">
                {format(new Date(subscription.starts_at), "MMM d, yyyy")}
              </span>
            </div>
            {subscription.ends_at && (
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Renews:</span>
                <span className="font-semibold text-foreground">
                  {format(new Date(subscription.ends_at), "MMM d, yyyy")}
                </span>
              </div>
            )}
          </div>

          {features.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-sm font-medium text-muted-foreground mb-2">Included features</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {features.map((f: string, i: number) => (
                  <li key={i} className="text-sm text-foreground flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="pt-3 border-t border-border">
            <Button
              onClick={handleManageSubscription}
              disabled={isPortalLoading}
              variant="outline"
              className="gap-2"
            >
              {isPortalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Settings className="h-4 w-4" />
              )}
              Manage Subscription
            </Button>
            <p className="text-xs text-muted-foreground mt-2">
              Upgrade, downgrade, or cancel your plan
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
