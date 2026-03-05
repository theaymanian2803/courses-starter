import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Crown } from "lucide-react";
import { toast } from "sonner";

type Tier = {
  id: string; name: string; slug: string; description: string | null;
  monthly_price: number; yearly_price: number; features: string[];
  is_active: boolean; sort_order: number; created_at: string;
};

export default function AdminTiers() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Tier | null>(null);
  const [form, setForm] = useState({
    name: "", slug: "", description: "", monthly_price: "", yearly_price: "",
    features: "", sort_order: "0",
  });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const { data: tiers, isLoading } = useQuery({
    queryKey: ["adminTiers"],
    queryFn: async () => {
      const { data, error } = await supabase.from("subscription_tiers").select("*").order("sort_order");
      if (error) throw error;
      return data as Tier[];
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["adminAllCourses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title, price").order("title");
      if (error) throw error;
      return data as { id: string; title: string; price: number }[];
    },
  });

  const { data: tierCourseMap } = useQuery({
    queryKey: ["tierCourseMap"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tier_courses").select("tier_id, course_id");
      if (error) throw error;
      const map: Record<string, string[]> = {};
      data?.forEach((tc: any) => {
        if (!map[tc.tier_id]) map[tc.tier_id] = [];
        map[tc.tier_id].push(tc.course_id);
      });
      return map;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const features = form.features.split("\n").map(f => f.trim()).filter(Boolean);
      const payload = {
        name: form.name, slug: form.slug, description: form.description || null,
        monthly_price: parseFloat(form.monthly_price) || 0,
        yearly_price: parseFloat(form.yearly_price) || 0,
        features, sort_order: parseInt(form.sort_order) || 0,
      };
      let tierId: string;
      if (editing) {
        const { error } = await supabase.from("subscription_tiers").update(payload).eq("id", editing.id);
        if (error) throw error;
        tierId = editing.id;
        await supabase.from("tier_courses").delete().eq("tier_id", tierId);
      } else {
        const { data, error } = await supabase.from("subscription_tiers").insert(payload).select("id").single();
        if (error) throw error;
        tierId = data.id;
      }
      if (selectedCourses.length > 0) {
        const { error } = await supabase.from("tier_courses").insert(
          selectedCourses.map(cid => ({ tier_id: tierId, course_id: cid }))
        );
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTiers"] });
      queryClient.invalidateQueries({ queryKey: ["tierCourseMap"] });
      toast.success(editing ? "Tier updated" : "Tier created");
      resetForm();
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("subscription_tiers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminTiers"] });
      toast.success("Tier deleted");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("subscription_tiers").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminTiers"] }),
  });

  const resetForm = () => {
    setForm({ name: "", slug: "", description: "", monthly_price: "", yearly_price: "", features: "", sort_order: "0" });
    setSelectedCourses([]);
    setEditing(null);
    setIsOpen(false);
  };

  const handleEdit = (tier: Tier) => {
    setEditing(tier);
    setForm({
      name: tier.name, slug: tier.slug, description: tier.description || "",
      monthly_price: tier.monthly_price.toString(), yearly_price: tier.yearly_price.toString(),
      features: (tier.features || []).join("\n"), sort_order: tier.sort_order.toString(),
    });
    setSelectedCourses(tierCourseMap?.[tier.id] || []);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Subscription Tiers</h1>
          <p className="text-muted-foreground">Manage pricing tiers and access levels</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Add Tier</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Tier" : "Create Tier"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Name</Label>
                  <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Pro" />
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} required placeholder="e.g. pro" />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monthly Price ($)</Label>
                  <Input type="number" step="0.01" value={form.monthly_price} onChange={e => setForm({ ...form, monthly_price: e.target.value })} required />
                </div>
                <div>
                  <Label>Yearly Price ($)</Label>
                  <Input type="number" step="0.01" value={form.yearly_price} onChange={e => setForm({ ...form, yearly_price: e.target.value })} required />
                </div>
              </div>
              <div>
                <Label>Features (one per line)</Label>
                <Textarea value={form.features} onChange={e => setForm({ ...form, features: e.target.value })} rows={4} placeholder="Access to all courses&#10;Community Discord&#10;Monthly Q&A calls" />
              </div>
              <div>
                <Label>Sort Order</Label>
                <Input type="number" value={form.sort_order} onChange={e => setForm({ ...form, sort_order: e.target.value })} />
              </div>
              <div>
                <Label className="mb-2 block">Accessible Courses</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-border p-3">
                  {courses?.map(course => (
                    <label key={course.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <Checkbox
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => setSelectedCourses(prev =>
                          prev.includes(course.id) ? prev.filter(id => id !== course.id) : [...prev, course.id]
                        )}
                      />
                      <span className="text-sm">{course.title}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tier</TableHead>
                  <TableHead>Monthly</TableHead>
                  <TableHead>Yearly</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tiers?.map(tier => (
                  <TableRow key={tier.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Crown className="h-4 w-4 text-primary" />
                        <div>
                          <span className="font-medium block">{tier.name}</span>
                          <span className="text-xs text-muted-foreground">{tier.slug}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>${tier.monthly_price}/mo</TableCell>
                    <TableCell>${tier.yearly_price}/yr</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{tierCourseMap?.[tier.id]?.length || 0} courses</Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={tier.is_active}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: tier.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(tier)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(tier.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {tiers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No tiers yet. Create Basic, Pro, and Elite tiers!
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
