import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Circle, TrendingUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface ModuleProgress {
  moduleTitle: string;
  lessons: {
    id: string;
    title: string;
    duration: string | null;
    completed: boolean;
  }[];
}

export function MyProgress({ userId }: { userId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["userProgress", userId],
    queryFn: async () => {
      const { data: modules } = await supabase
        .from("modules")
        .select("id, title, order_index, lessons(id, title, duration, order_index)")
        .order("order_index");

      const { data: progressData } = await supabase
        .from("lesson_progress")
        .select("lesson_id, completed")
        .eq("user_id", userId);

      const completedSet = new Set(
        progressData?.filter((p) => p.completed).map((p) => p.lesson_id) || []
      );

      return (modules || []).map((m) => ({
        moduleTitle: m.title,
        lessons: ((m.lessons as any[]) || [])
          .sort((a: any, b: any) => a.order_index - b.order_index)
          .map((l: any) => ({
            id: l.id,
            title: l.title,
            duration: l.duration,
            completed: completedSet.has(l.id),
          })),
      })) as ModuleProgress[];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-16">
        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">No progress yet</h3>
        <p className="text-muted-foreground">Start watching lessons to track your progress here.</p>
      </div>
    );
  }

  const totalLessons = data.reduce((acc, m) => acc + m.lessons.length, 0);
  const totalCompleted = data.reduce((acc, m) => acc + m.lessons.filter((l) => l.completed).length, 0);

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">{totalLessons}</p>
            <p className="text-xs text-muted-foreground">Total Lessons</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalCompleted}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-foreground">
              {totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0}%
            </p>
            <p className="text-xs text-muted-foreground">Overall</p>
          </CardContent>
        </Card>
      </div>

      {/* Per-module breakdown */}
      {data.map((mod, idx) => {
        const completed = mod.lessons.filter((l) => l.completed).length;
        return (
          <Card key={idx} className="border-border bg-card">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-foreground">{mod.moduleTitle}</h4>
                <Badge variant={completed === mod.lessons.length ? "default" : "secondary"}>
                  {completed}/{mod.lessons.length}
                </Badge>
              </div>
              <Separator />
              <ul className="space-y-2">
                {mod.lessons.map((lesson) => (
                  <li key={lesson.id} className="flex items-center gap-3 text-sm">
                    {lesson.completed ? (
                      <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
                    ) : (
                      <Circle className="h-4 w-4 text-muted-foreground/40 flex-shrink-0" />
                    )}
                    <span className={lesson.completed ? "text-foreground" : "text-muted-foreground"}>
                      {lesson.title}
                    </span>
                    {lesson.duration && (
                      <span className="ml-auto text-xs text-muted-foreground">{lesson.duration}</span>
                    )}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
