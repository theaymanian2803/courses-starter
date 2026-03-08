import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Marcus Johnson",
    initials: "MJ",
    role: "Full-Stack Developer",
    rating: 5,
    text: "This platform completely transformed my career. The structured curriculum and hands-on projects gave me the confidence to land my dream job within 3 months.",
  },
  {
    name: "Sarah Chen",
    initials: "SC",
    role: "Frontend Engineer",
    rating: 5,
    text: "The instructors break down complex concepts into digestible lessons. I went from zero coding experience to building production-ready apps. Absolutely worth every penny.",
  },
  {
    name: "David Okafor",
    initials: "DO",
    role: "Software Engineer",
    rating: 4,
    text: "The community and mentorship here are unmatched. Whenever I got stuck, there was always someone to help. The course quality rivals bootcamps costing 10x more.",
  },
  {
    name: "Emily Rodriguez",
    initials: "ER",
    role: "Junior Developer",
    rating: 5,
    text: "I tried multiple online platforms before finding this one. The difference is night and day — real projects, real feedback, and real results on my resume.",
  },
  {
    name: "James Wright",
    initials: "JW",
    role: "Tech Lead",
    rating: 5,
    text: "Even as an experienced developer, I found immense value in the advanced courses. Great for upskilling and staying current with modern technologies.",
  },
  {
    name: "Aisha Patel",
    initials: "AP",
    role: "Career Switcher",
    rating: 5,
    text: "Coming from a non-tech background, I was intimidated. But the beginner-friendly approach made learning enjoyable. Now I'm a confident developer with a new career.",
  },
];

export const Testimonials = () => {
  return (
    <section className="py-20 px-4 bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Student Success
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">
            What Our Students Say
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Join thousands of students who have transformed their careers through our courses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <Card
              key={t.name}
              className="border-border/50 bg-card hover:shadow-lg transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < t.rating
                          ? "fill-primary text-primary"
                          : "fill-muted text-muted"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed mb-6">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 bg-primary/10 border border-primary/20">
                    <AvatarFallback className="text-xs font-semibold text-primary bg-transparent">
                      {t.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
