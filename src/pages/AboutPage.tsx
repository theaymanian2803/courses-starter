import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { Code2, Target, Heart, Zap } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="pt-32 pb-20">
        <div className="container px-4">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              About <span className="text-primary">Unc Code Academy</span>
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">
              We're on a mission to make high-quality coding education accessible to everyone.
              Our project-based courses are designed by industry professionals to help you build
              real-world skills that employers actually want.
            </p>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              {
                icon: Target,
                title: "Our Mission",
                description:
                  "To empower aspiring developers with practical, hands-on skills through comprehensive courses that bridge the gap between learning and real-world application.",
              },
              {
                icon: Heart,
                title: "Our Values",
                description:
                  "We believe in quality over quantity, community-driven learning, and making education accessible regardless of background or experience level.",
              },
              {
                icon: Zap,
                title: "Our Approach",
                description:
                  "Every course is project-based and self-paced. You learn by building real applications, not just watching videos. Practice makes perfect.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="glass-strong rounded-2xl p-8 text-center group hover:border-primary/30 transition-all"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="max-w-3xl mx-auto glass-strong rounded-2xl p-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Our Story</h2>
            </div>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                Unc Code Academy was founded with a simple idea: coding education should be
                practical, affordable, and accessible. We noticed that many aspiring developers
                struggled to bridge the gap between tutorial-style learning and real-world
                development.
              </p>
              <p>
                That's why every course we create is built around real projects. Our instructors
                are experienced professionals who bring industry insights directly into the
                curriculum. Whether you're a complete beginner or looking to level up, we have a
                path for you.
              </p>
              <p>
                Today, we're proud to serve a growing community of learners who are building
                their careers in tech, one project at a time.
              </p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
