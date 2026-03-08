import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Code2, Menu, X, LogOut, ChevronDown,
  BookOpen, Layers, Zap, Users, HelpCircle,
  Mail, Shield, Star, GraduationCap, Sparkles,
  MessageSquare, Github, Youtube, BookMarked, Newspaper,
  Podcast, Trophy, Heart, Globe
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MegaMenuKey = "courses" | "resources" | "community" | "company" | null;

const courseLinks = [
  { icon: BookOpen, label: "Browse Courses", desc: "Explore our full catalog", to: "/courses" },
  { icon: Layers, label: "Course Bundles", desc: "Save with curated bundles", to: "/courses" },
  { icon: Star, label: "Featured", desc: "Our most popular courses", to: "/courses" },
  { icon: GraduationCap, label: "Learning Paths", desc: "Structured roadmaps", to: "/courses" },
];

const resourceLinks = [
  { icon: BookMarked, label: "Blog", desc: "Tutorials, tips & insights", to: "/courses" },
  { icon: Newspaper, label: "Changelog", desc: "Latest updates & releases", to: "/features" },
  { icon: Youtube, label: "YouTube", desc: "Free video tutorials", to: "/courses" },
  { icon: Podcast, label: "Podcast", desc: "Weekly dev conversations", to: "/courses" },
  { icon: Github, label: "Open Source", desc: "Contribute on GitHub", to: "/courses" },
  { icon: BookOpen, label: "Documentation", desc: "Guides & API references", to: "/courses" },
];

const communityLinks = [
  { icon: MessageSquare, label: "Discord Server", desc: "Chat with fellow learners", to: "/courses" },
  { icon: Users, label: "Student Forum", desc: "Ask questions & share", to: "/courses" },
  { icon: Trophy, label: "Leaderboard", desc: "Top contributors & streaks", to: "/courses" },
  { icon: Heart, label: "Mentorship", desc: "1-on-1 guidance from pros", to: "/courses" },
  { icon: Globe, label: "Events", desc: "Meetups, hackathons & more", to: "/courses" },
  { icon: Star, label: "Success Stories", desc: "Hear from our graduates", to: "/about" },
];

const companyLinks = [
  { icon: Users, label: "About Us", desc: "Our mission & team", to: "/about" },
  { icon: Sparkles, label: "Features", desc: "What makes us different", to: "/features" },
  { icon: HelpCircle, label: "FAQ", desc: "Common questions answered", to: "/faq" },
  { icon: Mail, label: "Contact", desc: "Get in touch with us", to: "/contact" },
  { icon: Shield, label: "Policies", desc: "Privacy & terms", to: "/policies" },
];

const megaSections = [
  { key: "courses" as const, label: "Courses" },
  { key: "resources" as const, label: "Resources" },
  { key: "community" as const, label: "Community" },
  { key: "company" as const, label: "Company" },
];

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeMega, setActiveMega] = useState<MegaMenuKey>(null);
  const [mobileExpanded, setMobileExpanded] = useState<MegaMenuKey>(null);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const headerRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMega(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate("/");
  };

  const userInitials = user?.user_metadata?.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  const openMega = (key: MegaMenuKey) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setActiveMega(key);
  };

  const closeMega = () => {
    closeTimer.current = setTimeout(() => setActiveMega(null), 150);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const getLinks = (key: MegaMenuKey) => {
    switch (key) {
      case "courses": return courseLinks;
      case "resources": return resourceLinks;
      case "community": return communityLinks;
      case "company": return companyLinks;
      default: return [];
    }
  };

  const renderMegaLinks = (links: typeof courseLinks) => (
    <div className="grid grid-cols-2 gap-1">
      {links.map((item) => (
        <Link
          key={item.label}
          to={item.to}
          onClick={() => setActiveMega(null)}
          className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-secondary/60 group"
        >
          <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
            <item.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{item.label}</p>
            <p className="text-xs text-muted-foreground">{item.desc}</p>
          </div>
        </Link>
      ))}
    </div>
  );

  const renderPromoCard = () => {
    if (activeMega === "courses") {
      return (
        <div className="hidden lg:flex w-64 flex-col justify-center rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 p-5">
          <Zap className="h-8 w-8 text-primary mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">New: AI Fundamentals</p>
          <p className="text-xs text-muted-foreground mb-3">Master the basics of AI & machine learning in 4 weeks.</p>
          <Button asChild size="sm" className="w-fit">
            <Link to="/courses" onClick={() => setActiveMega(null)}>Explore</Link>
          </Button>
        </div>
      );
    }
    if (activeMega === "resources") {
      return (
        <div className="hidden lg:flex w-64 flex-col justify-center rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/10 p-5">
          <Newspaper className="h-8 w-8 text-primary mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">Latest on the Blog</p>
          <p className="text-xs text-muted-foreground mb-3">Build a full-stack app with React & cloud backends in 2026.</p>
          <Button asChild size="sm" variant="outline" className="w-fit">
            <Link to="/courses" onClick={() => setActiveMega(null)}>Read More</Link>
          </Button>
        </div>
      );
    }
    if (activeMega === "community") {
      return (
        <div className="hidden lg:flex w-64 flex-col justify-center rounded-lg bg-gradient-to-br from-primary/10 to-accent/5 border border-primary/10 p-5">
          <MessageSquare className="h-8 w-8 text-primary mb-3" />
          <p className="text-sm font-semibold text-foreground mb-1">Join 5,000+ Devs</p>
          <p className="text-xs text-muted-foreground mb-3">Our Discord community is the best place to learn, share, and grow.</p>
          <Button asChild size="sm" className="w-fit">
            <Link to="/courses" onClick={() => setActiveMega(null)}>Join Discord</Link>
          </Button>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.header
      ref={headerRef}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "glass-strong py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <Code2 className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">
              Unc Code <span className="text-primary">Academy</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {megaSections.map((section) => (
              <div
                key={section.key}
                className="relative"
                onMouseEnter={() => openMega(section.key)}
                onMouseLeave={closeMega}
              >
                <button
                  className={cn(
                    "inline-flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    activeMega === section.key
                      ? "text-foreground bg-secondary/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/30"
                  )}
                  onClick={() => setActiveMega(activeMega === section.key ? null : section.key)}
                >
                  {section.label}
                  <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-200", activeMega === section.key && "rotate-180")} />
                </button>
              </div>
            ))}

            <a
              href="#pricing"
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/30"
            >
              Pricing
            </a>

            <div className="w-px h-6 bg-border mx-2" />

            {user ? (
              <div className="flex items-center gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link to="/dashboard">Dashboard</Link>
                </Button>
                <Link to="/profile" className="hover:opacity-80 transition-opacity">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-xs">{userInitials}</AvatarFallback>
                  </Avatar>
                </Link>
                <button onClick={handleSignOut} className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/30">
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button asChild variant="ghost" size="sm">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild size="sm">
                  <Link to="/auth">Get Started</Link>
                </Button>
              </div>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mega Menu Dropdown (Desktop) */}
        <AnimatePresence>
          {activeMega && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 right-0 top-full"
              onMouseEnter={cancelClose}
              onMouseLeave={closeMega}
            >
              <div className="container px-4 pt-2">
                <div className="rounded-xl border border-border bg-card/95 backdrop-blur-xl shadow-2xl shadow-primary/5 p-6">
                  <div className="flex gap-8">
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                        {activeMega === "courses" ? "Learn" : activeMega === "resources" ? "Resources" : activeMega === "community" ? "Community" : "Company"}
                      </p>
                      {renderMegaLinks(getLinks(activeMega))}
                    </div>
                    {renderPromoCard()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pt-4 pb-2 overflow-hidden"
            >
              <nav className="flex flex-col gap-1">
                {megaSections.map((section) => (
                  <div key={section.key}>
                    <button
                      onClick={() => setMobileExpanded(mobileExpanded === section.key ? null : section.key)}
                      className="w-full flex items-center justify-between py-2.5 px-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/30"
                    >
                      <span>{section.label}</span>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", mobileExpanded === section.key && "rotate-180")} />
                    </button>
                    <AnimatePresence>
                      {mobileExpanded === section.key && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden pl-2"
                        >
                          {getLinks(section.key).map((item) => (
                            <Link
                              key={item.label}
                              to={item.to}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="flex items-center gap-3 py-2.5 px-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/30"
                            >
                              <item.icon className="h-4 w-4 text-primary" />
                              {item.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}

                <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)} className="py-2.5 px-2 text-muted-foreground hover:text-foreground transition-colors rounded-md hover:bg-secondary/30">
                  Pricing
                </a>

                <div className="h-px bg-border my-2" />

                {user ? (
                  <div className="flex gap-2 pt-1">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>Dashboard</Link>
                    </Button>
                    <Button size="sm" className="flex-1" onClick={() => { handleSignOut(); setIsMobileMenuOpen(false); }}>
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 pt-1">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Sign In</Link>
                    </Button>
                    <Button asChild size="sm" className="flex-1">
                      <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>Get Started</Link>
                    </Button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};
