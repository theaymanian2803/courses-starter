import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Save, Twitter, Instagram, Linkedin, Youtube, Github, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type SocialLinks = {
  id: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  github_url: string;
};

const platforms = [
  { key: "twitter_url" as const, label: "Twitter / X", icon: Twitter, placeholder: "https://twitter.com/yourbrand" },
  { key: "instagram_url" as const, label: "Instagram", icon: Instagram, placeholder: "https://instagram.com/yourbrand" },
  { key: "linkedin_url" as const, label: "LinkedIn", icon: Linkedin, placeholder: "https://linkedin.com/company/yourbrand" },
  { key: "youtube_url" as const, label: "YouTube", icon: Youtube, placeholder: "https://youtube.com/@yourbrand" },
  { key: "github_url" as const, label: "GitHub", icon: Github, placeholder: "https://github.com/yourbrand" },
];

export default function AdminSocialLinks() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Omit<SocialLinks, "id">>({
    twitter_url: "",
    instagram_url: "",
    linkedin_url: "",
    youtube_url: "",
    github_url: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["social-links"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_links")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as SocialLinks;
    },
  });

  useEffect(() => {
    if (data) {
      setForm({
        twitter_url: data.twitter_url || "",
        instagram_url: data.instagram_url || "",
        linkedin_url: data.linkedin_url || "",
        youtube_url: data.youtube_url || "",
        github_url: data.github_url || "",
      });
    }
  }, [data]);

  const updateMutation = useMutation({
    mutationFn: async (values: Omit<SocialLinks, "id">) => {
      if (!data?.id) throw new Error("No social links record found");
      const { error } = await supabase
        .from("social_links")
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-links"] });
      toast.success("Social links updated!");
    },
    onError: () => toast.error("Failed to update social links"),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Social Links</h1>
        <p className="text-muted-foreground mt-1">
          Manage the social media links displayed in the footer.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Social Media Profiles</CardTitle>
          <CardDescription>
            Enter the full URL for each platform. Leave empty to hide the icon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {platforms.map((platform) => (
              <div key={platform.key} className="space-y-2">
                <Label className="flex items-center gap-2">
                  <platform.icon className="h-4 w-4 text-muted-foreground" />
                  {platform.label}
                </Label>
                <div className="flex gap-2">
                  <Input
                    value={form[platform.key]}
                    onChange={(e) => setForm({ ...form, [platform.key]: e.target.value })}
                    placeholder={platform.placeholder}
                    type="url"
                    className="flex-1"
                  />
                  {form[platform.key] && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      asChild
                    >
                      <a href={form[platform.key]} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            ))}

            <Button type="submit" disabled={updateMutation.isPending} className="mt-4">
              {updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
