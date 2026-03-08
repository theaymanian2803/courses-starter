import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { BookOpen, PlayCircle } from "lucide-react";
import { Link } from "react-router-dom";

interface CourseWithProgress {
  id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  totalLessons: number;
  completedLessons: number;
}

export function MyCourses({ userId }: { userId: string }) {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["userCourses", userId],
    queryFn: async () => {
      // Get purchased courses
      const { data: purchases, error: purchaseError } = await supabase
        .from("purchases")
        .select("course_id")
        .eq("user_id", userId);
      if (purchaseError) throw purchaseError;

      if (!purchases || purchases.length === 0) return [];

      const courseIds = purchases.map((p) => p.course_id);

      // Get course details
      const { data: coursesData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, description, thumbnail_url")
        .in("id", courseIds);
      if (courseError) throw courseError;

      // Get all modules and their lesson counts for these courses
      const { data: modules } = await supabase
        .from("modules")
        .select("id, course_id, lessons(id)")
        .in("course_id", courseIds);

      // Get user progress
      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", userId);

      const completedSet = new Set(
        progressData?.filter((p) => p.completed).map((p) => p.lesson_id) || []
      );

      return (coursesData || []).map((course) => {
        const courseModules = modules?.filter((m) => m.course_id === course.id) || [];
        const allLessonIds = courseModules.flatMap((m) =>
          (m.lessons as any[])?.map((l: any) => l.id) || []
        );
        return {
          ...course,
          totalLessons: allLessonIds.length,
          completedLessons: allLessonIds.filter((id) => completedSet.has(id)).length,
        } as CourseWithProgress;
      });
    },
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!courses || courses.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No courses enrolled</h3>
        <p className="text-muted-foreground mb-6">Enroll in a course to start tracking your progress.</p>
        <Button asChild>
          <Link to="/courses">Browse Courses</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {courses.map((course) => {
        const pct = course.totalLessons > 0
          ? Math.round((course.completedLessons / course.totalLessons) * 100)
          : 0;

        return (
          <Card key={course.id} className="border-border bg-card overflow-hidden hover:border-primary/30 transition-colors">
            {course.thumbnail_url && (
              <div className="h-36 bg-muted overflow-hidden">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardContent className="p-4 space-y-3">
              <h4 className="font-semibold text-foreground">{course.title}</h4>
              {course.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{course.description}</p>
              )}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {course.completedLessons} of {course.totalLessons} lessons
                  </span>
                  <Badge variant={pct === 100 ? "default" : "secondary"}>{pct}%</Badge>
                </div>
                <Progress value={pct} className="h-2" />
              </div>
              <Button asChild size="sm" className="w-full">
                <Link to="/dashboard">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  {pct > 0 ? "Continue Learning" : "Start Course"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
