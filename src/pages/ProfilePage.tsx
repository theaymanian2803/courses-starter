import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/landing/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, ArrowLeft, ShoppingBag, BookOpen, TrendingUp, User, CreditCard } from "lucide-react";
import { MyOrders } from "@/components/account/MyOrders";
import { MyCourses } from "@/components/account/MyCourses";
import { MyProgress } from "@/components/account/MyProgress";
import { MySubscription } from "@/components/account/MySubscription";
import { ProfileSettings } from "@/components/account/ProfileSettings";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "orders";
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<{ full_name: string; avatar_url: string | null }>({
    full_name: "",
    avatar_url: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEmailUser, setIsEmailUser] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUser(session.user);
      setIsEmailUser(session.user.app_metadata?.provider === "email");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, avatar_url")
        .eq("user_id", session.user.id)
        .single();

      if (profileData) {
        setProfile({
          full_name: profileData.full_name || session.user.user_metadata?.full_name || "",
          avatar_url: profileData.avatar_url || session.user.user_metadata?.avatar_url || null,
        });
      } else {
        setProfile({
          full_name: session.user.user_metadata?.full_name || "",
          avatar_url: session.user.user_metadata?.avatar_url || null,
        });
      }
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) navigate("/auth");
    });

    init();
    return () => subscription.unsubscribe();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container max-w-4xl mx-auto px-4 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="mb-6 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <h1 className="text-3xl font-bold text-foreground mb-2">My Account</h1>
          <p className="text-muted-foreground mb-8">Manage your orders, courses, progress, and profile settings.</p>

          <Tabs defaultValue="orders" className="w-full">
            <TabsList className="w-full grid grid-cols-5 mb-8">
              <TabsTrigger value="orders" className="gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="courses" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Courses</span>
              </TabsTrigger>
              <TabsTrigger value="progress" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Progress</span>
              </TabsTrigger>
              <TabsTrigger value="subscription" className="gap-2">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Subscription</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders">
              <MyOrders userId={user.id} />
            </TabsContent>

            <TabsContent value="courses">
              <MyCourses userId={user.id} />
            </TabsContent>

            <TabsContent value="progress">
              <MyProgress userId={user.id} />
            </TabsContent>

            <TabsContent value="subscription">
              <MySubscription userId={user.id} />
            </TabsContent>

            <TabsContent value="profile">
              <Card className="border-border bg-card">
                <CardContent className="p-6">
                  <ProfileSettings
                    user={user}
                    profile={profile}
                    setProfile={setProfile}
                    isEmailUser={isEmailUser}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
