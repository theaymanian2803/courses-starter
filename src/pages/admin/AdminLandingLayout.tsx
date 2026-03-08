import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { GripVertical, Eye, EyeOff, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface Section {
  id: string;
  section_key: string;
  title: string;
  is_visible: boolean;
  sort_order: number;
}

export default function AdminLandingLayout() {
  const queryClient = useQueryClient();

  const { data: sections = [], isLoading } = useQuery({
    queryKey: ["landingPageSections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("landing_page_sections")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Section[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: { id: string; is_visible?: boolean; sort_order?: number }[]) => {
      for (const update of updates) {
        const { error } = await supabase
          .from("landing_page_sections")
          .update({ is_visible: update.is_visible, sort_order: update.sort_order, updated_at: new Date().toISOString() })
          .eq("id", update.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landingPageSections"] });
      toast.success("Layout updated");
    },
    onError: () => toast.error("Failed to update layout"),
  });

  const toggleVisibility = (section: Section) => {
    updateMutation.mutate([{ id: section.id, is_visible: !section.is_visible, sort_order: section.sort_order }]);
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= sections.length) return;

    const updates = [
      { id: sections[index].id, is_visible: sections[index].is_visible, sort_order: sections[swapIndex].sort_order },
      { id: sections[swapIndex].id, is_visible: sections[swapIndex].is_visible, sort_order: sections[index].sort_order },
    ];
    updateMutation.mutate(updates);
  };

  const sectionLinks: Record<string, string> = {
    hero: "/admin",
    featured_courses: "/admin/courses",
    instructors: "/admin/instructors",
    testimonials: "/admin/testimonials",
    pricing: "/admin/courses",
    subscription_pricing: "/admin/tiers",
  };

  if (isLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Landing Page Layout</h1>
        <p className="text-muted-foreground">
          Toggle visibility and reorder sections of the landing page.
        </p>
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors"
            >
              <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={() => moveSection(index, "up")}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === sections.length - 1}
                  onClick={() => moveSection(index, "down")}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground">{section.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">({section.section_key})</span>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {section.is_visible ? (
                  <Eye className="h-4 w-4 text-primary" />
                ) : (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  checked={section.is_visible}
                  onCheckedChange={() => toggleVisibility(section)}
                />
                {sectionLinks[section.section_key] && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.href = sectionLinks[section.section_key]}
                  >
                    Edit Content
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
