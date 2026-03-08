import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, Loader2, Save, Image, Type, BarChart3, Layers, Upload, Link } from "lucide-react";
import { toast } from "sonner";

interface HeroSettings {
  id: string;
  heading_line1: string;
  heading_highlight: string;
  heading_line3: string;
  subheading: string;
  badge_text: string;
  cta_primary_text: string;
  cta_secondary_text: string;
  stat1_value: string;
  stat1_label: string;
  stat2_value: string;
  stat2_label: string;
  stat3_value: string;
  stat3_label: string;
  stat4_value: string;
  stat4_label: string;
  background_image_url: string | null;
  overlay_image_url: string | null;
  overlay_inset: number;
}

export default function HeroControls() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["heroSettings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hero_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as HeroSettings;
    },
  });

  const [form, setForm] = useState<HeroSettings | null>(null);

  const displayForm = form || settings;

  const updateField = (field: keyof HeroSettings, value: string) => {
    setForm((prev) => ({
      ...(prev || settings!),
      [field]: value,
    }));
  };

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<HeroSettings>) => {
      const { id, ...rest } = data as HeroSettings;
      const payload = { ...rest, overlay_inset: Number(rest.overlay_inset) || 0, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from("hero_settings")
        .update(payload)
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["heroSettings"] });
      toast.success("Hero section updated!");
      setForm(null);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update hero section");
    },
  });

  const handleSave = () => {
    if (!displayForm) return;
    saveMutation.mutate(displayForm);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    try {
      const filePath = `hero/hero-bg-${Date.now()}.${file.name.split(".").pop()}`;
      const { error: uploadError } = await supabase.storage
        .from("course-thumbnails")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("course-thumbnails")
        .getPublicUrl(filePath);

      updateField("background_image_url", publicUrl);
      toast.success("Image uploaded! Click Save to apply.");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image");
    }
  };

  if (isLoading) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card className="border-border">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardTitle className="flex items-center justify-between text-lg">
              <span className="flex items-center gap-2">
                <Type className="h-5 w-5 text-primary" />
                Hero Section Controls
              </span>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6 pt-0">
            {/* Headings */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Headings</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1.5">
                  <Label htmlFor="heading_line1">Line 1</Label>
                  <Input id="heading_line1" value={displayForm?.heading_line1 || ""} onChange={(e) => updateField("heading_line1", e.target.value)} className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="heading_highlight">Highlight Text</Label>
                  <Input id="heading_highlight" value={displayForm?.heading_highlight || ""} onChange={(e) => updateField("heading_highlight", e.target.value)} className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="heading_line3">Line 3</Label>
                  <Input id="heading_line3" value={displayForm?.heading_line3 || ""} onChange={(e) => updateField("heading_line3", e.target.value)} className="bg-muted/50" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="subheading">Subheading</Label>
                <Textarea id="subheading" value={displayForm?.subheading || ""} onChange={(e) => updateField("subheading", e.target.value)} className="bg-muted/50" rows={2} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="badge_text">Badge Text</Label>
                <Input id="badge_text" value={displayForm?.badge_text || ""} onChange={(e) => updateField("badge_text", e.target.value)} className="bg-muted/50" />
              </div>
            </div>

            <Separator />

            {/* CTAs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Call to Action Buttons</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="cta_primary">Primary Button</Label>
                  <Input id="cta_primary" value={displayForm?.cta_primary_text || ""} onChange={(e) => updateField("cta_primary_text", e.target.value)} className="bg-muted/50" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="cta_secondary">Secondary Button</Label>
                  <Input id="cta_secondary" value={displayForm?.cta_secondary_text || ""} onChange={(e) => updateField("cta_secondary_text", e.target.value)} className="bg-muted/50" />
                </div>
              </div>
            </div>

            <Separator />

            {/* Stats */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Stats
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="flex gap-2">
                    <div className="space-y-1.5 flex-1">
                      <Label>Stat {n} Value</Label>
                      <Input value={(displayForm as any)?.[`stat${n}_value`] || ""} onChange={(e) => updateField(`stat${n}_value` as keyof HeroSettings, e.target.value)} className="bg-muted/50" />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <Label>Stat {n} Label</Label>
                      <Input value={(displayForm as any)?.[`stat${n}_label`] || ""} onChange={(e) => updateField(`stat${n}_label` as keyof HeroSettings, e.target.value)} className="bg-muted/50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Background Image */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Image className="h-4 w-4" />
                Background Image
              </h3>
              {displayForm?.background_image_url && (
                <div className="relative rounded-lg overflow-hidden h-32 bg-muted">
                  <img src={displayForm.background_image_url} alt="Hero background" className="w-full h-full object-cover" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => updateField("background_image_url", "")}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <Tabs defaultValue="upload" className="w-full">
                <TabsList className="w-full">
                  <TabsTrigger value="upload" className="flex-1 gap-1.5"><Upload className="h-3.5 w-3.5" />Upload</TabsTrigger>
                  <TabsTrigger value="url" className="flex-1 gap-1.5"><Link className="h-3.5 w-3.5" />Paste URL</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-2">
                  <Input type="file" accept="image/*" onChange={handleImageUpload} className="bg-muted/50" />
                  <p className="text-xs text-muted-foreground mt-1">Upload a background image (max 5MB).</p>
                </TabsContent>
                <TabsContent value="url" className="mt-2">
                  <Input
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={displayForm?.background_image_url || ""}
                    onChange={(e) => updateField("background_image_url", e.target.value)}
                    className="bg-muted/50"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Paste a direct link to an image.</p>
                </TabsContent>
              </Tabs>
            </div>

            <Separator />

            {/* Overlay Image */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Layers className="h-4 w-4" />
                Overlay Image (Faded Absolute)
              </h3>
              <p className="text-xs text-muted-foreground">
                This image sits behind the text content with a fade effect. Use the inset value to control how far inward it's positioned from all edges.
              </p>
              {displayForm?.overlay_image_url && (
                <div className="relative rounded-lg overflow-hidden h-32 bg-muted">
                  <img src={displayForm.overlay_image_url} alt="Hero overlay" className="w-full h-full object-cover opacity-60" />
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => updateField("overlay_image_url", "")}
                  >
                    Remove
                  </Button>
                </div>
              )}
              <Input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
                  if (file.size > 5 * 1024 * 1024) { toast.error("Image must be less than 5MB"); return; }
                  try {
                    const filePath = `hero/hero-overlay-${Date.now()}.${file.name.split(".").pop()}`;
                    const { error: uploadError } = await supabase.storage.from("course-thumbnails").upload(filePath, file, { upsert: true });
                    if (uploadError) throw uploadError;
                    const { data: { publicUrl } } = supabase.storage.from("course-thumbnails").getPublicUrl(filePath);
                    updateField("overlay_image_url", publicUrl);
                    toast.success("Overlay image uploaded! Click Save to apply.");
                  } catch (error: any) {
                    toast.error(error.message || "Failed to upload image");
                  }
                }}
                className="bg-muted/50"
              />
              <div className="space-y-1.5">
                <Label htmlFor="overlay_inset">Inset (px)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="overlay_inset"
                    type="number"
                    min={0}
                    max={200}
                    value={displayForm?.overlay_inset ?? 0}
                    onChange={(e) => updateField("overlay_inset", e.target.value)}
                    className="bg-muted/50 w-28"
                  />
                  <span className="text-xs text-muted-foreground">
                    Current: {displayForm?.overlay_inset ?? 0}px from all edges
                  </span>
                </div>
              </div>
            </div>

            <Button onClick={handleSave} disabled={saveMutation.isPending} className="w-full py-5 box-glow">
              {saveMutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
              Save Hero Changes
            </Button>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
