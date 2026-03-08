import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { FeaturedCourses } from "@/components/landing/FeaturedCourses";
import { Instructors } from "@/components/landing/Instructors";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { SubscriptionPricing } from "@/components/landing/SubscriptionPricing";
import { Footer } from "@/components/landing/Footer";

const sectionComponents: Record<string, React.FC> = {
  hero: Hero,
  featured_courses: FeaturedCourses,
  instructors: Instructors,
  testimonials: Testimonials,
  pricing: Pricing,
  subscription_pricing: SubscriptionPricing,
};

const Index = () => {
  const { data: sections } = useQuery({
    queryKey: ["landingPageSections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_sections")
        .select("*")
        .eq("is_visible", true)
        .order("sort_order");
      if (error) throw error;
      return data;
    },
  });

  // Fallback to default order if sections haven't loaded yet
  const defaultOrder = ["hero", "featured_courses", "instructors", "testimonials", "pricing", "subscription_pricing"];
  const visibleKeys = sections?.map((s) => s.section_key) ?? defaultOrder;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {visibleKeys.map((key) => {
        const Component = sectionComponents[key];
        return Component ? <Component key={key} /> : null;
      })}
      <Footer />
    </div>
  );
};

export default Index;
