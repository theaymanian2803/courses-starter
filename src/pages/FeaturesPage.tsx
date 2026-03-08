import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  PlayCircle,
  MessageSquare,
  Award,
  Layers,
  ShieldCheck,
  Smartphone,
  Clock,
  Users,
} from "lucide-react";

const features = [
  {
    icon: PlayCircle,
    title: "HD Video Lessons",
    description:
      "Crystal-clear video content with professional production quality so you never miss a detail.",
  },
  {
    icon: Layers,
    title: "Project-Based Learning",
    description:
      "Build real-world applications as you learn. Every course includes hands-on projects to solidify your skills.",
  },
  {
    icon: Clock,
    title: "Self-Paced Courses",
    description:
      "Learn on your own schedule. Access course materials anytime, anywhere, and revisit lessons as needed.",
  },
  {
    icon: MessageSquare,
    title: "Lesson Comments & Discussion",
    description:
      "Ask questions and interact with other learners directly on each lesson. Get notified when someone replies.",
  },
  {
    icon: Award,
    title: "Completion Certificates",
    description:
      "Earn certificates when you complete courses to showcase your achievements on your resume or portfolio.",
  },
  {
    icon: Users,
    title: "Community Support",
    description:
      "Join a community of like-minded learners. Collaborate, share insights, and grow together.",
  },
  {
    icon: Smartphone,
    title: "Mobile Friendly",
    description:
      "Our platform is fully responsive. Learn from your phone, tablet, or desktop—whatever works for you.",
  },
  {
    icon: ShieldCheck,
    title: "30-Day Money-Back Guarantee",
    description:
      "Not satisfied? Get a full refund within 30 days. We're confident you'll love the experience.",
  },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Platform <span className="text-primary">Features</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Everything you need to learn, practice, and grow as a developer—all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="glass-strong rounded-2xl p-6 group hover:border-primary/30 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
