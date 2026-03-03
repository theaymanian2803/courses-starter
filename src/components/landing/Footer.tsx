import { Code2 } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="py-12 bg-muted/10 border-t border-border">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Code2 className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">
              Unc Code <span className="text-primary">Academy</span>
            </span>
          </Link>

          {/* Links */}
          <nav className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <Link to="/courses" className="hover:text-foreground transition-colors">
              Courses
            </Link>
            <a href="#pricing" className="hover:text-foreground transition-colors">
              Pricing
            </a>
            <Link to="/auth" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Unc Code Academy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
