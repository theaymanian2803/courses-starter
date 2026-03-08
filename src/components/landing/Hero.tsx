import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Code, Zap, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const defaults = {
  heading_line1: "Master the",
  heading_highlight: "MERN Stack",
  heading_line3: "From Beginning to End",
  subheading: "Build production-ready fullstack applications with MongoDB, Express, React, and Node.js. Learn from real-world projects and land your dream job.",
  badge_text: "New: Updated for 2025",
  cta_primary_text: "Get Started Now",
  cta_secondary_text: "Preview Curriculum",
  stat1_value: "100+", stat1_label: "Video Lessons",
  stat2_value: "5,000+", stat2_label: "Students",
  stat3_value: "8", stat3_label: "Modules",
  stat4_value: "50+", stat4_label: "Hours Content",
  background_image_url: null as string | null,
};

export const Hero = () => {
  const { data: settings } = useQuery({
    queryKey: ["heroSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) return defaults;
      return data;
    },
    staleTime: 60000,
  });

  const h = settings || defaults;

  const stats = [
    { icon: Code, value: h.stat1_value, label: h.stat1_label },
    { icon: Users, value: h.stat2_value, label: h.stat2_label },
    { icon: Zap, value: h.stat3_value, label: h.stat3_label },
    { icon: Play, value: h.stat4_value, label: h.stat4_label },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Background image or default */}
      {h.background_image_url ? (
        <div className="absolute inset-0">
          <img src={h.background_image_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/80" />
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-glow-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-glow-pulse delay-1000" />
          <div
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
              backgroundSize: '60px 60px'
            }}
          />
        </div>
      )}

      <div className="container relative z-10 px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">{h.badge_text}</span>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            <span className="text-foreground">{h.heading_line1}</span>
            <br />
            <span className="text-primary text-glow">{h.heading_highlight}</span>
            <br />
            <span className="text-foreground">{h.heading_line3}</span>
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {h.subheading}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-16"
          >
            <Button asChild size="lg" className="text-lg px-8 py-6 box-glow">
              <Link to="/auth">
                {h.cta_primary_text}
                <Zap className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6 group">
              <a href="#curriculum">
                <Play className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
                {h.cta_secondary_text}
              </a>
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                className="glass rounded-xl p-4 text-center"
              >
                <stat.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-3 bg-primary rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
};
