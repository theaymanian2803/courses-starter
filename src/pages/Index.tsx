import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Courses } from "@/components/landing/Courses";
import { Curriculum } from "@/components/landing/Curriculum";
import { Instructor } from "@/components/landing/Instructor";
import { Pricing } from "@/components/landing/Pricing";
import { Footer } from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Hero />
      <Courses />
      <Curriculum />
      <Instructor />
      <Pricing />
      <Footer />
    </div>
  );
};

export default Index;
