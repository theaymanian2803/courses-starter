import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, Clock, Users, ShoppingCart, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { EnrollModal } from "@/components/checkout/EnrollModal";

type Course = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  thumbnail_url: string | null;
};

export function Courses() {
  const navigate = useNavigate();
  const [enrollCourse, setEnrollCourse] = useState<Course | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: courses, isLoading } = useQuery({
    queryKey: ["courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Course[];
    },
  });

  const handleViewCourse = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  if (isLoading) {
    return (
      <section id="courses" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Courses
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Master in-demand skills with our comprehensive courses
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <section id="courses" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Our Courses
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              New courses coming soon! Stay tuned for exciting content.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="courses" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Our Courses
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Master in-demand skills with our comprehensive, project-based courses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Card
              key={course.id}
              className="overflow-hidden group hover:shadow-xl transition-all duration-300 border-border/50 bg-card"
            >
              <div className="relative h-48 overflow-hidden bg-muted">
                {course.thumbnail_url ? (
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                    <BookOpen className="h-16 w-16 text-primary/50" />
                  </div>
                )}
                <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-semibold">
                  ${course.price}
                </div>
              </div>

              <CardHeader className="pb-2">
                <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2">
                  {course.title}
                </h3>
              </CardHeader>

              <CardContent className="pb-4">
                <p className="text-muted-foreground line-clamp-3 text-sm">
                  {course.description || "No description available."}
                </p>
                <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>Self-paced</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>All levels</span>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="pt-0 gap-2">
                <Button
                  onClick={() => handleViewCourse(course.id)}
                  variant="outline"
                  className="flex-1"
                  size="lg"
                >
                  View Course
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEnrollCourse(course);
                  }}
                  className="flex-1"
                  size="lg"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Enroll
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
      {enrollCourse && (
        <EnrollModal
          open={!!enrollCourse}
          onOpenChange={(open) => !open && setEnrollCourse(null)}
          course={enrollCourse}
        />
      )}
    </section>
  );
}
