import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { FeaturedCourses } from "@/components/landing/FeaturedCourses";
import { Instructors } from "@/components/landing/Instructors";
import { Testimonials } from "@/components/landing/Testimonials";
import { Pricing } from "@/components/landing/Pricing";
import { SubscriptionPricing } from "@/components/landing/SubscriptionPricing";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <FeaturedCourses />
      <Instructors />
      <Testimonials />
      <Pricing />
      <SubscriptionPricing />
      <Footer />
    </div>
  );
};

export default Index;
