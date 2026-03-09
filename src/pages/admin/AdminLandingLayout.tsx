import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { GripVertical, Eye, EyeOff, ArrowUp, ArrowDown, Save, Type, PanelBottom, Megaphone } from "lucide-react";
import { toast } from "sonner";

interface Section {
  id: string;
  section_key: string;
  title: string;
  is_visible: boolean;
  sort_order: number;
}

interface SiteSettings {
  id: string;
  brand_name: string;
  brand_highlight: string;
  footer_description: string;
  copyright_text: string;
  promo_title: string;
  promo_description: string;
  promo_cta_text: string;
  promo_cta_link: string;
}

export default function AdminLandingLayout() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState<SiteSettings | null>(null);

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

  const { data: siteSettings, isLoading: settingsLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as SiteSettings;
    },
  });

  useEffect(() => {
    if (siteSettings) setSettings(siteSettings);
  }, [siteSettings]);

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

  const settingsMutation = useMutation({
    mutationFn: async (data: Partial<SiteSettings>) => {
      if (!settings?.id) throw new Error("No settings found");
      const { error } = await supabase
        .from("site_settings")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", settings.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Settings saved");
    },
    onError: () => toast.error("Failed to save settings"),
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

  const handleSaveSettings = () => {
    if (!settings) return;
    const { id, ...rest } = settings;
    settingsMutation.mutate(rest);
  };

  const sectionLinks: Record<string, string> = {
    hero: "/admin",
    featured_courses: "/admin/courses",
    instructors: "/admin/instructors",
    testimonials: "/admin/testimonials",
    pricing: "/admin/courses",
    subscription_pricing: "/admin/tiers",
  };

  if (isLoading || settingsLoading) {
    return <div className="text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Landing Page Layout</h1>
        <p className="text-muted-foreground">
          Toggle visibility, reorder sections, and customize header & footer.
        </p>
      </div>

      {/* Header & Branding */}
      {settings && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              Header & Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Brand Name</Label>
                <Input
                  value={settings.brand_name}
                  onChange={(e) => setSettings({ ...settings, brand_name: e.target.value })}
                  placeholder="Unc Code"
                />
              </div>
              <div className="space-y-2">
                <Label>Brand Highlight</Label>
                <Input
                  value={settings.brand_highlight}
                  onChange={(e) => setSettings({ ...settings, brand_highlight: e.target.value })}
                  placeholder="Academy"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Preview: <span className="font-bold text-foreground">{settings.brand_name} <span className="text-primary">{settings.brand_highlight}</span></span>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Promo Card */}
      {settings && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-primary" />
              Mega Menu Promo Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Promo Title</Label>
                <Input
                  value={settings.promo_title}
                  onChange={(e) => setSettings({ ...settings, promo_title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>CTA Text</Label>
                <Input
                  value={settings.promo_cta_text}
                  onChange={(e) => setSettings({ ...settings, promo_cta_text: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Promo Description</Label>
              <Textarea
                value={settings.promo_description}
                onChange={(e) => setSettings({ ...settings, promo_description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>CTA Link</Label>
              <Input
                value={settings.promo_cta_link}
                onChange={(e) => setSettings({ ...settings, promo_cta_link: e.target.value })}
                placeholder="/courses"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footer */}
      {settings && (
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <PanelBottom className="h-5 w-5 text-primary" />
              Footer
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Footer Description</Label>
              <Textarea
                value={settings.footer_description}
                onChange={(e) => setSettings({ ...settings, footer_description: e.target.value })}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label>Copyright Text</Label>
              <Input
                value={settings.copyright_text}
                onChange={(e) => setSettings({ ...settings, copyright_text: e.target.value })}
                placeholder="Unc Code Academy"
              />
              <p className="text-xs text-muted-foreground">
                Preview: © {new Date().getFullYear()} {settings.copyright_text}. All rights reserved.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Save button */}
      {settings && (
        <Button onClick={handleSaveSettings} disabled={settingsMutation.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {settingsMutation.isPending ? "Saving..." : "Save Settings"}
        </Button>
      )}

      {/* Sections */}
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
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === 0} onClick={() => moveSection(index, "up")}>
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" disabled={index === sections.length - 1} onClick={() => moveSection(index, "down")}>
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground">{section.title}</span>
                <span className="ml-2 text-xs text-muted-foreground">({section.section_key})</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                {section.is_visible ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                <Switch checked={section.is_visible} onCheckedChange={() => toggleVisibility(section)} />
                {sectionLinks[section.section_key] && (
                  <Button variant="outline" size="sm" onClick={() => window.location.href = sectionLinks[section.section_key]}>
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
