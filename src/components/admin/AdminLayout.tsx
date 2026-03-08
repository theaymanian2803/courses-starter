import { useEffect, useState } from "react";
import { useNavigate, Outlet, Link, useLocation } from "react-router-dom";
import { useAdmin } from "@/hooks/useAdmin";
import { supabase } from "@/integrations/supabase/client";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavLink } from "@/components/NavLink";
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  PlayCircle, 
  Users, 
  LogOut,
  Loader2,
  ShieldX,
  Lock,
  Tag,
  Package,
  Sparkles,
  Crown,
  MessageSquareQuote,
  GraduationCap,
  Share2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ADMIN_ACCESS_CODE = "123123";

const adminNavItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Courses", url: "/admin/courses", icon: BookOpen },
  { title: "Modules", url: "/admin/modules", icon: Layers },
  { title: "Lessons", url: "/admin/lessons", icon: PlayCircle },
  { title: "Bundles", url: "/admin/bundles", icon: Package },
  { title: "Upsells", url: "/admin/upsells", icon: Sparkles },
  { title: "Tiers", url: "/admin/tiers", icon: Crown },
  { title: "Users", url: "/admin/users", icon: Users },
  { title: "Coupons", url: "/admin/coupons", icon: Tag },
  { title: "Testimonials", url: "/admin/testimonials", icon: MessageSquareQuote },
  { title: "Instructors", url: "/admin/instructors", icon: GraduationCap },
];

function AdminSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent className="bg-sidebar">
        <div className="p-4 border-b border-border">
          <Link to="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">U</span>
            </div>
            {!collapsed && (
              <span className="font-bold text-lg text-foreground">Admin Panel</span>
            )}
          </Link>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      end={item.url === "/admin"}
                      className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-muted/50 transition-colors"
                      activeClassName="bg-primary/10 text-primary font-medium"
                    >
                      <item.icon className="h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function AdminLayout() {
  const navigate = useNavigate();
  const { isAdmin, isLoading, userId } = useAdmin();
  const [codeVerified, setCodeVerified] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [codeError, setCodeError] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("admin_code_verified");
    if (stored === "true") {
      setCodeVerified(true);
    }
  }, []);

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput === ADMIN_ACCESS_CODE) {
      setCodeVerified(true);
      setCodeError(false);
      sessionStorage.setItem("admin_code_verified", "true");
    } else {
      setCodeError(true);
    }
  };

  const handleResetCode = () => {
    sessionStorage.removeItem("admin_code_verified");
    setCodeVerified(false);
    setCodeInput("");
    setCodeError(false);
  };

  const handleLogout = async () => {
    sessionStorage.removeItem("admin_code_verified");
    await supabase.auth.signOut();
    navigate("/");
  };

  // Show code entry screen first
  if (!codeVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-sm px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Admin Access</h1>
          <p className="text-muted-foreground mb-6">
            Enter the admin access code to continue.
          </p>
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <Input
              type="password"
              placeholder="Enter access code"
              value={codeInput}
              onChange={(e) => {
                setCodeInput(e.target.value);
                setCodeError(false);
              }}
              className={codeError ? "border-destructive" : ""}
              autoFocus
            />
            {codeError && (
              <p className="text-sm text-destructive">Incorrect access code.</p>
            )}
            <Button type="submit" className="w-full">
              Verify
            </Button>
          </form>
          <Button variant="ghost" size="sm" className="mt-4" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  // Not logged in — prompt to sign in
  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in with an admin account to access this area.
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => navigate("/auth")}>
              Sign In
            </Button>
            <Button variant="outline" onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <ShieldX className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don't have administrator privileges. Sign in with an admin account or re-enter the access code.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={handleResetCode}>
              Re-enter Code
            </Button>
            <Button onClick={() => navigate("/")}>
              Back to Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b border-border flex items-center justify-between px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <span className="text-sm text-muted-foreground">Unc Code Academy</span>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                View Site
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
