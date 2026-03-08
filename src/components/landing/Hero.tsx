import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Play, Code, Zap, Users, ArrowRight, Flame, BookOpen, Clock, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  overlay_image_url: null as string | null,
  overlay_inset: 0,
  overlay_opacity: 0.3,
};

export const Hero = () => {
  const [showCurriculum, setShowCurriculum] = useState(false);
  const navigate = useNavigate();

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

  const { data: topCourses } = useQuery({
    queryKey: ["topCourses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);
      if (error) throw error;
      return data;
    },
  });

  const h = settings || defaults;

  const stats = [
    { icon: Code, value: h.stat1_value, label: h.stat1_label },
    { icon: Users, value: h.stat2_value, label: h.stat2_label },
    { icon: Zap, value: h.stat3_value, label: h.stat3_label },
    { icon: Play, value: h.stat4_value, label: h.stat4_label },
  ];

  return (
    <>
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden gradient-hero">
      {/* Background */}
      {h.background_image_url ? (
        <div className="absolute inset-0">
          <img src={h.background_image_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-background/80" />
        </div>
      ) : (
        <div className="absolute inset-0 overflow-hidden">
          {/* Crimson ambient glows */}
          <div className="absolute top-1/4 left-1/6 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/3 rounded-full blur-[200px]" />
          {/* Subtle grid */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(hsl(var(--primary) / 0.5) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.5) 1px, transparent 1px)`,
              backgroundSize: '80px 80px'
            }}
          />
          {/* Noise texture overlay */}
          <div className="absolute inset-0 opacity-[0.015]" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
          }} />
        </div>
      )}

      {/* Overlay image */}
      {h.overlay_image_url && (
        <div
          className="absolute z-[1] overflow-hidden rounded-2xl pointer-events-none"
          style={{
            top: `${h.overlay_inset || 0}px`,
            right: `${h.overlay_inset || 0}px`,
            bottom: `${h.overlay_inset || 0}px`,
            left: `${h.overlay_inset || 0}px`,
          }}
        >
          <img src={h.overlay_image_url} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/40" />
          <div className="absolute inset-0" style={{ backgroundColor: `hsl(var(--background) / ${Number(h.overlay_opacity ?? 0.3)})` }} />
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 mb-8"
          >
            <Flame className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-foreground/80">{h.badge_text}</span>
          </motion.div>

          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
            <span className="text-foreground">{h.heading_line1}</span>
            <br />
            <span className="text-primary">{h.heading_highlight}</span>
            <br />
            <span className="text-foreground/80">{h.heading_line3}</span>
          </h1>

          {/* Subheading */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
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
            <Button asChild size="lg" className="text-lg px-8 py-6 font-semibold">
              <Link to="/auth">
                {h.cta_primary_text}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-6 group border-border/50" onClick={() => setShowCurriculum(true)}>
                <Play className="mr-2 h-5 w-5 group-hover:text-primary transition-colors" />
                {h.cta_secondary_text}
            </Button>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                className="rounded-xl p-4 text-center border border-border/30 bg-card/50 backdrop-blur-sm"
              >
                <stat.icon className="h-5 w-5 mx-auto mb-2 text-primary" />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
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
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center p-1">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-3 bg-primary rounded-full"
          />
        </div>
      </motion.div>
    </section>

    {/* Curriculum Preview Modal */}
    <Dialog open={showCurriculum} onOpenChange={setShowCurriculum}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Our Top Courses</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 mt-2">
          {topCourses && topCourses.length > 0 ? (
            topCourses.map((course) => (
              <div
                key={course.id}
                onClick={() => { setShowCurriculum(false); navigate(`/course/${course.id}`); }}
                className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-muted/30 hover:bg-muted/60 transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">{course.title}</p>
                  <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{course.description || "No description"}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Self-paced</span>
                    <span className="font-semibold text-primary">${course.price}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-6">Courses coming soon!</p>
          )}
        </div>
        <Button asChild size="lg" className="w-full mt-2">
          <Link to="/courses" onClick={() => setShowCurriculum(false)}>
            View All Courses
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </DialogContent>
    </Dialog>
    </>
  );
};
