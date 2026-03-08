import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, Github, Linkedin, Twitter } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

const parseSpecialties = (s: Json): string[] => {
  if (Array.isArray(s)) return s.filter((v): v is string => typeof v === "string");
  return [];
};

export const Instructors = () => {
  const { data: instructors, isLoading } = useQuery({
    queryKey: ["instructors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instructors")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-20 px-4">
        <div className="flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </section>
    );
  }

  if (!instructors?.length) return null;

  return (
    <section className="py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <span className="text-sm font-semibold tracking-widest uppercase text-primary">
            Meet the Team
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 text-foreground">
            Learn From Industry Experts
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto">
            Our instructors bring real-world experience from top tech companies to help you build production-ready skills.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {instructors.map((inst) => {
            const specialties = parseSpecialties(inst.specialties);
            const initials = inst.name
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2);

            return (
              <Card
                key={inst.id}
                className="border-border/50 bg-card hover:shadow-xl transition-all duration-300 group overflow-hidden"
              >
                <CardContent className="p-0">
                  {/* Avatar area */}
                  <div className="relative bg-gradient-to-br from-primary/10 to-primary/5 p-8 flex justify-center">
                    <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                      {inst.avatar_url ? (
                        <img src={inst.avatar_url} alt={inst.name} className="object-cover" />
                      ) : (
                        <AvatarFallback className="text-2xl font-bold text-primary bg-primary/10">
                          {initials}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </div>

                  {/* Info */}
                  <div className="p-6 text-center">
                    <h3 className="text-lg font-bold text-foreground">{inst.name}</h3>
                    <p className="text-sm text-primary font-medium mt-1">{inst.title}</p>
                    <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                      {inst.bio}
                    </p>

                    {/* Specialties */}
                    {specialties.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        {specialties.map((s) => (
                          <Badge
                            key={s}
                            variant="secondary"
                            className="text-xs font-medium"
                          >
                            {s}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Social links */}
                    {(inst.github_url || inst.linkedin_url || inst.twitter_url) && (
                      <div className="flex gap-3 justify-center mt-5">
                        {inst.github_url && (
                          <a href={inst.github_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Github className="h-4 w-4" />
                          </a>
                        )}
                        {inst.linkedin_url && (
                          <a href={inst.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Linkedin className="h-4 w-4" />
                          </a>
                        )}
                        {inst.twitter_url && (
                          <a href={inst.twitter_url} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors">
                            <Twitter className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
