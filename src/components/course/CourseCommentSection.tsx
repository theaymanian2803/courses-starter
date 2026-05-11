import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  MessageSquare,
  Send,
  Loader2,
  Trash2,
  Pencil,
  X,
  Check,
  Reply,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CourseCommentSectionProps {
  courseId: string;
  moduleId?: string | null;
  userId: string | null;
  title?: string;
}

type Comment = {
  id: string;
  course_id: string;
  module_id: string | null;
  user_id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  profile?: { full_name: string | null; avatar_url: string | null } | null;
  replies?: Comment[];
};

export function CourseCommentSection({
  courseId,
  moduleId = null,
  userId,
  title = "Discussion",
}: CourseCommentSectionProps) {
  const queryClient = useQueryClient();
  const queryKey = ["courseComments", courseId, moduleId ?? "course"];

  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set());

  const { data: comments = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      let q = supabase
        .from("course_comments")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });
      q = moduleId ? q.eq("module_id", moduleId) : q.is("module_id", null);
      const { data, error } = await q;
      if (error) throw error;

      const userIds = [...new Set((data || []).map((c: Comment) => c.user_id))];
      const profileMap = new Map<string, { full_name: string | null; avatar_url: string | null }>();
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", userIds);
        for (const p of profiles || []) profileMap.set(p.user_id, p);
      }

      const all = (data || []).map((c: Comment) => ({ ...c, profile: profileMap.get(c.user_id) || null }));
      const top: Comment[] = [];
      const replyMap = new Map<string, Comment[]>();
      for (const c of all) {
        if (!c.parent_id) top.push({ ...c, replies: [] });
        else {
          const arr = replyMap.get(c.parent_id) || [];
          arr.push(c);
          replyMap.set(c.parent_id, arr);
        }
      }
      for (const c of top) c.replies = replyMap.get(c.id) || [];
      return top;
    },
    enabled: !!userId,
  });

  const addComment = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string | null }) => {
      const { error } = await supabase.from("course_comments").insert({
        course_id: courseId,
        module_id: moduleId,
        user_id: userId!,
        content: content.trim(),
        parent_id: parentId || null,
      });
      if (error) throw error;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey });
      if (vars.parentId) {
        setReplyingTo(null);
        setReplyContent("");
        setExpandedThreads((p) => new Set(p).add(vars.parentId!));
        toast.success("Reply posted!");
      } else {
        setNewComment("");
        toast.success("Comment posted!");
      }
    },
    onError: () => toast.error("Failed to post comment."),
  });

  const updateComment = useMutation({
    mutationFn: async ({ id, content }: { id: string; content: string }) => {
      const { error } = await supabase
        .from("course_comments")
        .update({ content: content.trim() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setEditingId(null);
      toast.success("Comment updated!");
    },
    onError: () => toast.error("Failed to update comment."),
  });

  const deleteComment = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("course_comments").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Comment deleted.");
    },
    onError: () => toast.error("Failed to delete comment."),
  });

  const toggleThread = (id: string) => {
    setExpandedThreads((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const getInitials = (name?: string | null) =>
    !name ? "U" : name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const totalCount = comments.reduce((s, c) => s + 1 + (c.replies?.length || 0), 0);

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`flex gap-3 p-3 rounded-lg ${
        isReply ? "bg-muted/20 ml-8 border-l-2 border-primary/20" : "bg-muted/30"
      }`}
    >
      <Avatar className={`${isReply ? "h-7 w-7" : "h-8 w-8"} shrink-0`}>
        <AvatarFallback className="text-xs bg-primary/10 text-primary">
          {getInitials(comment.profile?.full_name)}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">
              {comment.profile?.full_name || "Anonymous"}
            </span>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-1">
            {userId === comment.user_id && (
              <>
                {editingId === comment.id ? (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => updateComment.mutate({ id: comment.id, content: editContent })}
                      disabled={!editContent.trim() || updateComment.isPending}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}>
                      <X className="h-3.5 w-3.5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => deleteComment.mutate(comment.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {editingId === comment.id ? (
          <Textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="mt-1 min-h-[60px] resize-none"
            maxLength={2000}
          />
        ) : (
          <p className="text-sm text-foreground/90 mt-1 whitespace-pre-wrap break-words">
            {comment.content}
          </p>
        )}
        {!isReply && (
          <div className="flex items-center gap-3 mt-2">
            {userId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setReplyingTo(replyingTo === comment.id ? null : comment.id);
                  setReplyContent("");
                }}
              >
                <Reply className="h-3.5 w-3.5 mr-1" />
                Reply
              </Button>
            )}
            {comment.replies && comment.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => toggleThread(comment.id)}
              >
                {expandedThreads.has(comment.id) ? (
                  <ChevronUp className="h-3.5 w-3.5 mr-1" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5 mr-1" />
                )}
                {comment.replies.length} {comment.replies.length === 1 ? "reply" : "replies"}
              </Button>
            )}
          </div>
        )}
        {!isReply && replyingTo === comment.id && (
          <div className="flex gap-2 mt-2">
            <Textarea
              placeholder={`Reply to ${comment.profile?.full_name || "Anonymous"}...`}
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="min-h-[60px] resize-none flex-1 text-sm"
              maxLength={2000}
              autoFocus
            />
            <div className="flex flex-col gap-1 self-end">
              <Button
                size="icon"
                className="h-8 w-8"
                onClick={() => addComment.mutate({ content: replyContent, parentId: comment.id })}
                disabled={!replyContent.trim() || addComment.isPending}
              >
                {addComment.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyContent("");
                }}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
        {!isReply && expandedThreads.has(comment.id) && comment.replies && comment.replies.length > 0 && (
          <div className="mt-3 space-y-2">{comment.replies.map((r) => renderComment(r, true))}</div>
        )}
      </div>
    </div>
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return;
    addComment.mutate({ content: newComment });
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2 text-foreground">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold text-lg">
          {title} {totalCount > 0 && `(${totalCount})`}
        </h3>
      </div>
      <Separator />
      {userId ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <Textarea
            placeholder="Share your thoughts..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px] resize-none flex-1"
            maxLength={2000}
          />
          <Button
            type="submit"
            size="icon"
            className="self-end h-10 w-10"
            disabled={!newComment.trim() || addComment.isPending}
          >
            {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      ) : (
        <p className="text-sm text-muted-foreground italic">Sign in to leave a comment.</p>
      )}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No comments yet. Be the first to share your thoughts!
        </p>
      ) : (
        <div className="space-y-3">{comments.map((c) => renderComment(c))}</div>
      )}
    </div>
  );
}
