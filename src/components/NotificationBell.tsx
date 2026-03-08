import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Check, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  userId: string;
}

interface Notification {
  id: string;
  user_id: string;
  comment_id: string;
  reply_id: string;
  is_read: boolean;
  created_at: string;
  reply?: {
    content: string;
    user_id: string;
    lesson_id: string;
    profile?: { full_name: string | null } | null;
    lesson?: { title: string } | null;
  };
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);

  const { data: notifications = [] } = useQuery({
    queryKey: ["commentNotifications", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("comment_notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);
      if (error) throw error;

      if (!data || data.length === 0) return [];

      // Fetch reply details
      const replyIds = data.map((n: any) => n.reply_id);
      const { data: replies } = await supabase
        .from("lesson_comments")
        .select("id, content, user_id, lesson_id")
        .in("id", replyIds);

      const replyMap = new Map((replies || []).map((r: any) => [r.id, r]));

      // Fetch profiles for reply authors
      const replyUserIds = [...new Set((replies || []).map((r: any) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name")
        .in("user_id", replyUserIds);
      const profileMap = new Map((profiles || []).map((p: any) => [p.user_id, p]));

      // Fetch lesson titles
      const lessonIds = [...new Set((replies || []).map((r: any) => r.lesson_id))];
      const { data: lessons } = await supabase
        .from("lessons")
        .select("id, title")
        .in("id", lessonIds);
      const lessonMap = new Map((lessons || []).map((l: any) => [l.id, l]));

      return data.map((n: any) => {
        const reply = replyMap.get(n.reply_id);
        return {
          ...n,
          reply: reply
            ? {
                ...reply,
                profile: profileMap.get(reply.user_id) || null,
                lesson: lessonMap.get(reply.lesson_id) || null,
              }
            : null,
        };
      }) as Notification[];
    },
    refetchInterval: 30000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = useMutation({
    mutationFn: async (id: string) => {
      await supabase
        .from("comment_notifications")
        .update({ is_read: true })
        .eq("id", id);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["commentNotifications", userId] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => {
      await supabase
        .from("comment_notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["commentNotifications", userId] }),
  });

  const clearAll = useMutation({
    mutationFn: async () => {
      await supabase
        .from("comment_notifications")
        .delete()
        .eq("user_id", userId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["commentNotifications", userId] }),
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-3 border-b">
          <h4 className="font-semibold text-sm">Notifications</h4>
          <div className="flex gap-1">
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => markAllRead.mutate()}
              >
                <Check className="h-3 w-3 mr-1" />
                Read all
              </Button>
            )}
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-destructive hover:text-destructive"
                onClick={() => clearAll.mutate()}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={cn(
                  "p-3 border-b last:border-b-0 cursor-pointer hover:bg-muted/50 transition-colors",
                  !n.is_read && "bg-primary/5"
                )}
                onClick={() => !n.is_read && markAsRead.mutate(n.id)}
              >
                <div className="flex gap-2">
                  <MessageSquare className="h-4 w-4 mt-0.5 shrink-0 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">
                      <span className="font-medium">
                        {n.reply?.profile?.full_name || "Someone"}
                      </span>{" "}
                      replied to your comment
                      {n.reply?.lesson && (
                        <>
                          {" "}
                          on{" "}
                          <span className="font-medium text-primary">
                            {n.reply.lesson.title}
                          </span>
                        </>
                      )}
                    </p>
                    {n.reply?.content && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        "{n.reply.content}"
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.created_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                  {!n.is_read && (
                    <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
                  )}
                </div>
              </div>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
