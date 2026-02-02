import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, Shield, Download, Clock, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  { icon: Download, text: "Complete source code included" },
  { icon: Clock, text: "Lifetime access to all content" },
  { icon: Shield, text: "30-day money-back guarantee" },
  { icon: MessageCircle, text: "Community Discord access" },
  { icon: Zap, text: "All future updates included" },
  { icon: Check, text: "Certificate of completion" },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="py-24 bg-background relative overflow-hidden">
      {/* Background glow */}
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
            One-Time Payment
          </Badge>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            Invest in Your <span className="text-primary">Future</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Get complete access to the entire course with a single payment. 
            No subscriptions, no hidden fees.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="max-w-lg mx-auto"
        >
          <div className="glass-strong rounded-3xl p-8 md:p-10 border border-primary/20 box-glow relative">
            {/* Popular badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-medium">
                Most Popular
              </Badge>
            </div>

            {/* Course title */}
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-foreground mb-2">
                Fullstack MERN Masterclass
              </h3>
              <p className="text-muted-foreground">
                Complete course with all modules
              </p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl text-muted-foreground line-through">$399</span>
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                  50% OFF
                </Badge>
              </div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl md:text-6xl font-bold text-foreground">$199</span>
                <span className="text-muted-foreground">USD</span>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                One-time payment • Lifetime access
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 mb-8">
              {features.map((feature, index) => (
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

            {/* CTA */}
            <Button asChild size="lg" className="w-full text-lg py-6 box-glow">
              <Link to="/auth">
                Enroll Now
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>

            <p className="text-center text-sm text-muted-foreground mt-4">
              🔒 Secure checkout powered by Stripe
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
