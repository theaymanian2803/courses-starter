import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { FeaturedCourses } from "@/components/landing/FeaturedCourses";
import { Pricing } from "@/components/landing/Pricing";
import { SubscriptionPricing } from "@/components/landing/SubscriptionPricing";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturedCourses />
      <Pricing />
      <SubscriptionPricing />
      <Footer />
    </div>
  );
};

export default Index;
