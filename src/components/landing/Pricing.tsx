import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Shield, Download, Clock, MessageCircle, Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { PaymentOptions } from "./PaymentOptions";

const bundleFeatures = [
  { icon: Download, text: "Access to ALL courses" },
  { icon: Clock, text: "Lifetime access to all content" },
  { icon: Shield, text: "30-day money-back guarantee" },
  { icon: MessageCircle, text: "Community Discord access" },
  { icon: Zap, text: "All future updates included" },
  { icon: Check, text: "Certificate of completion" },
];

type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail_url: string | null;
};

export const Pricing = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState(false);

  const { data: courses } = useQuery({
    queryKey: ["pricingCourses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Course[];
    },
  });

  const totalIndividual = courses?.reduce((sum, c) => sum + c.price, 0) ?? 0;
  const bundlePrice = 130;

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);

      if (session?.user) {
        const { data: purchases } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", session.user.id);
        setHasPurchased((purchases && purchases.length > 0) || false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />

      <div className="container px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <Badge variant="outline" className="mb-4">
            Pricing
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Choose Your <span className="text-primary">Plan</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Buy courses individually or save with the all-access bundle
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">
          {/* Individual Courses */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="rounded-3xl p-8 border border-border/50 bg-card">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">Individual Courses</h3>
                <p className="text-muted-foreground text-sm">Pick what you need</p>
              </div>

              <div className="space-y-3 mb-6">
                {courses?.map((course, index) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.2 + index * 0.08 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border/30"
                  >
                    <span className="text-foreground text-sm font-medium truncate mr-3">{course.title}</span>
                    <span className="text-primary font-bold text-sm whitespace-nowrap">${course.price}</span>
                  </motion.div>
                ))}
                {(!courses || courses.length === 0) && (
                  <p className="text-muted-foreground text-center py-4 text-sm">Courses coming soon</p>
                )}
              </div>

              {courses && courses.length > 0 && (
                <div className="text-center border-t border-border/30 pt-4">
                  <p className="text-muted-foreground text-sm">
                    Total if bought separately: <span className="text-foreground font-semibold">${totalIndividual}</span>
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                size="lg"
                className="w-full mt-6"
                onClick={() => navigate("/courses")}
              >
                Browse Courses
              </Button>
            </div>
          </motion.div>

          {/* Bundle - All Access */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="glass-strong rounded-3xl p-8 md:p-10 border border-primary/20 box-glow relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-medium">
                  <Star className="h-3 w-3 mr-1" /> Best Value
                </Badge>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-foreground mb-2">All-Access Bundle</h3>
                <p className="text-muted-foreground">Every course, one payment</p>
              </div>

              <div className="text-center mb-8">
                {totalIndividual > bundlePrice && (
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl text-muted-foreground line-through">${totalIndividual}</span>
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      SAVE ${totalIndividual - bundlePrice}
                    </Badge>
                  </div>
                )}
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl md:text-6xl font-bold text-foreground">${bundlePrice}</span>
                  <span className="text-muted-foreground">USD</span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  One-time payment • Lifetime access
                </p>
              </div>

              <div className="space-y-4 mb-8">
                {bundleFeatures.map((feature, index) => (
                  <motion.div
                    key={feature.text}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <feature.icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{feature.text}</span>
                  </motion.div>
                ))}
              </div>

              {hasPurchased ? (
                <Button asChild size="lg" className="w-full text-lg py-6">
                  <Link to="/dashboard">
                    Go to Dashboard
                    <Zap className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              ) : (
                <PaymentOptions
                  isLoggedIn={!!user}
                  onLoginRequired={() => navigate("/auth")}
                />
              )}

              <p className="text-center text-sm text-muted-foreground mt-4">
                🔒 Secure checkout via PayPal or bank transfer
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
