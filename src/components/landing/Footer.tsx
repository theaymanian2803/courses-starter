import { Code2, Youtube, Podcast, Github, BookOpen, MessageSquare, Users, Heart, Twitter, Instagram, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const resourceLinks = [
  { icon: Youtube, label: "YouTube", to: "/courses" },
  { icon: Podcast, label: "Podcast", to: "/courses" },
  { icon: Github, label: "Open Source", to: "/courses" },
  { icon: BookOpen, label: "Documentation", to: "/courses" },
];

const communityLinks = [
  { icon: MessageSquare, label: "Discord Server", to: "/courses" },
  { icon: Users, label: "Student Forum", to: "/courses" },
  { icon: Heart, label: "Mentorship", to: "/courses" },
];

const companyLinks = [
  { label: "Courses", to: "/courses" },
  { label: "Features", to: "/features" },
  { label: "About", to: "/about" },
  { label: "FAQ", to: "/faq" },
  { label: "Contact", to: "/contact" },
  { label: "Policies", to: "/policies" },
  { label: "Dashboard", to: "/dashboard" },
];

const socialPlatforms = [
  { key: "twitter_url", icon: Twitter },
  { key: "instagram_url", icon: Instagram },
  { key: "linkedin_url", icon: Linkedin },
  { key: "youtube_url", icon: Youtube },
  { key: "github_url", icon: Github },
] as const;

export const Footer = () => {
  const { data: socialLinks } = useQuery({
    queryKey: ["social-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data;
    },
  });

  return (
    <footer className="py-16 bg-muted/10 border-t border-border">
      <div className="container px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Code2 className="h-4 w-4 text-primary" />
              </div>
              <span className="text-lg font-bold text-foreground">
                Unc Code <span className="text-primary">Academy</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Learn to code with hands-on projects and expert instructors. Join thousands of developers building the future.
            </p>
            <div className="flex items-center gap-3">
              {socialPlatforms.map(({ key, icon: Icon }) => {
                const url = socialLinks?.[key];
                if (!url) return null;
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Resources</h4>
            <ul className="space-y-2.5">
              {resourceLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Community</h4>
            <ul className="space-y-2.5">
              {communityLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                    <link.icon className="h-3.5 w-3.5" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Unc Code Academy. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
