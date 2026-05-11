import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Loader2,
  Trash2,
  MessageSquare,
  Search,
  CornerDownRight,
  ShieldAlert,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type Source = "course" | "lesson";

type Row = {
  id: string;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  // contextual
  course_id?: string | null;
  module_id?: string | null;
  lesson_id?: string | null;
  source: Source;
};

export default function AdminComments() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Source>("course");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "top" | "replies">("all");
  const [pendingDelete, setPendingDelete] = useState<Row | null>(null);

  // Course comments
  const { data: courseRows = [], isLoading: loadingCourse } = useQuery({
    queryKey: ["adminCourseComments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_comments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []).map((r: any) => ({ ...r, source: "course" as Source }));
    },
  });

  // Lesson comments
  const { data: lessonRows = [], isLoading: loadingLesson } = useQuery({
    queryKey: ["adminLessonComments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lesson_comments")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data || []).map((r: any) => ({ ...r, source: "lesson" as Source }));
    },
  });

  const allRows: Row[] = tab === "course" ? courseRows : lessonRows;

  // Lookups
  const userIds = useMemo(
    () => [...new Set(allRows.map((r) => r.user_id))],
    [allRows]
  );
  const courseIds = useMemo(
    () => [...new Set(allRows.map((r) => r.course_id).filter(Boolean) as string[])],
    [allRows]
  );
  const moduleIds = useMemo(
    () => [...new Set(allRows.map((r) => r.module_id).filter(Boolean) as string[])],
    [allRows]
  );
  const lessonIds = useMemo(
    () => [...new Set(allRows.map((r) => r.lesson_id).filter(Boolean) as string[])],
    [allRows]
  );

  const { data: profiles = [] } = useQuery({
    queryKey: ["profilesByIds", userIds],
    queryFn: async () => {
      if (userIds.length === 0) return [];
      const { data } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", userIds);
      return data || [];
    },
    enabled: userIds.length > 0,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["coursesByIds", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const { data } = await supabase
        .from("courses")
        .select("id, title")
        .in("id", courseIds);
      return data || [];
    },
    enabled: courseIds.length > 0,
  });

  const { data: modules = [] } = useQuery({
    queryKey: ["modulesByIds", moduleIds],
    queryFn: async () => {
      if (moduleIds.length === 0) return [];
      const { data } = await supabase
        .from("modules")
        .select("id, title, course_id")
        .in("id", moduleIds);
      return data || [];
    },
    enabled: moduleIds.length > 0,
  });

  const { data: lessons = [] } = useQuery({
    queryKey: ["lessonsByIds", lessonIds],
    queryFn: async () => {
      if (lessonIds.length === 0) return [];
      const { data } = await supabase
        .from("lessons")
        .select("id, title, module_id")
        .in("id", lessonIds);
      return data || [];
    },
    enabled: lessonIds.length > 0,
  });

  const profileMap = useMemo(
    () => new Map(profiles.map((p) => [p.user_id, p.full_name])),
    [profiles]
  );
  const courseMap = useMemo(
    () => new Map(courses.map((c) => [c.id, c.title])),
    [courses]
  );
  const moduleMap = useMemo(
    () => new Map(modules.map((m) => [m.id, m])),
    [modules]
  );
  const lessonMap = useMemo(
    () => new Map(lessons.map((l) => [l.id, l])),
    [lessons]
  );

  const deleteMutation = useMutation({
    mutationFn: async (row: Row) => {
      const table = row.source === "course" ? "course_comments" : "lesson_comments";
      const { error } = await supabase.from(table).delete().eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: (_, row) => {
      queryClient.invalidateQueries({
        queryKey: [row.source === "course" ? "adminCourseComments" : "adminLessonComments"],
      });
      toast.success("Comment removed.");
      setPendingDelete(null);
    },
    onError: (e: any) => {
      toast.error(e?.message || "Failed to remove comment.");
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allRows.filter((r) => {
      if (filter === "top" && r.parent_id) return false;
      if (filter === "replies" && !r.parent_id) return false;
      if (!q) return true;
      const name = (profileMap.get(r.user_id) || "").toLowerCase();
      const courseTitle = (r.course_id ? courseMap.get(r.course_id) : "") || "";
      const lesson = r.lesson_id ? lessonMap.get(r.lesson_id) : null;
      const lessonTitle = lesson?.title || "";
      return (
        r.content.toLowerCase().includes(q) ||
        name.includes(q) ||
        courseTitle.toLowerCase().includes(q) ||
        lessonTitle.toLowerCase().includes(q)
      );
    });
  }, [allRows, search, filter, profileMap, courseMap, lessonMap]);

  const renderContext = (row: Row) => {
    if (row.source === "course") {
      const courseTitle = row.course_id ? courseMap.get(row.course_id) : null;
      const mod = row.module_id ? moduleMap.get(row.module_id) : null;
      return (
        <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
          <Badge variant="outline" className="text-[10px]">Course</Badge>
          <span className="truncate">{courseTitle || "Unknown course"}</span>
          {mod && (
            <>
              <span>·</span>
              <Badge variant="outline" className="text-[10px]">Section</Badge>
              <span className="truncate">{mod.title}</span>
            </>
          )}
        </div>
      );
    }
    const lesson = row.lesson_id ? lessonMap.get(row.lesson_id) : null;
    const mod = lesson?.module_id ? moduleMap.get(lesson.module_id) : null;
    const courseTitle = mod?.course_id ? courseMap.get(mod.course_id) : null;
    return (
      <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1">
        <Badge variant="outline" className="text-[10px]">Lesson</Badge>
        <span className="truncate">{lesson?.title || "Unknown lesson"}</span>
        {courseTitle && (
          <>
            <span>·</span>
            <span className="truncate">{courseTitle}</span>
          </>
        )}
      </div>
    );
  };

  const isLoading = tab === "course" ? loadingCourse : loadingLesson;
  const totalCount = allRows.length;
  const replyCount = allRows.filter((r) => r.parent_id).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
          <ShieldAlert className="h-7 w-7 text-primary" />
          Comment Moderation
        </h1>
        <p className="text-muted-foreground mt-1">
          Review and remove inappropriate comments and replies across the site.
        </p>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Source)}>
        <TabsList>
          <TabsTrigger value="course">
            Course & Section ({courseRows.length})
          </TabsTrigger>
          <TabsTrigger value="lesson">
            Lesson ({lessonRows.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  {totalCount} comment{totalCount !== 1 ? "s" : ""} ·{" "}
                  {replyCount} repl{replyCount !== 1 ? "ies" : "y"}
                </CardTitle>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search content, user, course…"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 w-full sm:w-72"
                    />
                  </div>
                  <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
                    <SelectTrigger className="w-full sm:w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="top">Top-level only</SelectItem>
                      <SelectItem value="replies">Replies only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-muted-foreground py-12 text-sm">
                  No comments match the current filters.
                </p>
              ) : (
                <div className="space-y-3">
                  {filtered.map((row) => (
                    <div
                      key={row.id}
                      className="flex gap-3 p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {row.parent_id && (
                              <CornerDownRight className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-sm font-medium text-foreground">
                              {profileMap.get(row.user_id) || "Anonymous"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(row.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                            {row.parent_id && (
                              <Badge variant="secondary" className="text-[10px]">
                                Reply
                              </Badge>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => setPendingDelete(row)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Remove
                          </Button>
                        </div>
                        {renderContext(row)}
                        <p className="text-sm text-foreground/90 whitespace-pre-wrap break-words">
                          {row.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this comment?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently deletes the comment for everyone. Replies to this
              comment are not removed automatically.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {pendingDelete && (
            <div className="rounded-md border bg-muted/30 p-3 text-sm text-foreground/90 whitespace-pre-wrap break-words max-h-40 overflow-auto">
              {pendingDelete.content}
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                if (pendingDelete) deleteMutation.mutate(pendingDelete);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Removing…
                </>
              ) : (
                "Remove"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
