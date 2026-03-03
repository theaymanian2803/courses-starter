import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Courses } from "@/components/landing/Courses";

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-24">
        <Courses />
      </div>
      <Footer />
    </div>
  );
}
