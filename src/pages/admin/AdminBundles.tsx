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
import { Plus, Pencil, Trash2, Loader2, Package } from "lucide-react";
import { toast } from "sonner";

type Course = { id: string; title: string; price: number };
type Bundle = {
  id: string; title: string; description: string | null;
  price: number; is_active: boolean; created_at: string;
};

export default function AdminBundles() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<Bundle | null>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "" });
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  const { data: bundles, isLoading } = useQuery({
    queryKey: ["adminBundles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bundles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as Bundle[];
    },
  });

  const { data: courses } = useQuery({
    queryKey: ["adminAllCourses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("id, title, price").order("title");
      if (error) throw error;
      return data as Course[];
    },
  });

  const { data: bundleCourseMap } = useQuery({
    queryKey: ["bundleCourseMap"],
    queryFn: async () => {
      const { data, error } = await supabase.from("bundle_courses").select("bundle_id, course_id");
      if (error) throw error;
      const map: Record<string, string[]> = {};
      data?.forEach((bc: any) => {
        if (!map[bc.bundle_id]) map[bc.bundle_id] = [];
        map[bc.bundle_id].push(bc.course_id);
      });
      return map;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (editing) {
        const { error } = await supabase.from("bundles").update({
          title: form.title, description: form.description || null,
          price: parseFloat(form.price) || 0,
        }).eq("id", editing.id);
        if (error) throw error;
        // Update courses
        await supabase.from("bundle_courses").delete().eq("bundle_id", editing.id);
        if (selectedCourses.length > 0) {
          const { error: bcErr } = await supabase.from("bundle_courses").insert(
            selectedCourses.map(cid => ({ bundle_id: editing.id, course_id: cid }))
          );
          if (bcErr) throw bcErr;
        }
      } else {
        const { data, error } = await supabase.from("bundles").insert({
          title: form.title, description: form.description || null,
          price: parseFloat(form.price) || 0,
        }).select("id").single();
        if (error) throw error;
        if (selectedCourses.length > 0) {
          const { error: bcErr } = await supabase.from("bundle_courses").insert(
            selectedCourses.map(cid => ({ bundle_id: data.id, course_id: cid }))
          );
          if (bcErr) throw bcErr;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBundles"] });
      queryClient.invalidateQueries({ queryKey: ["bundleCourseMap"] });
      toast.success(editing ? "Bundle updated" : "Bundle created");
      resetForm();
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("bundles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBundles"] });
      toast.success("Bundle deleted");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("bundles").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminBundles"] }),
  });

  const resetForm = () => {
    setForm({ title: "", description: "", price: "" });
    setSelectedCourses([]);
    setEditing(null);
    setIsOpen(false);
  };

  const handleEdit = (bundle: Bundle) => {
    setEditing(bundle);
    setForm({ title: bundle.title, description: bundle.description || "", price: bundle.price.toString() });
    setSelectedCourses(bundleCourseMap?.[bundle.id] || []);
    setIsOpen(true);
  };

  const toggleCourse = (courseId: string) => {
    setSelectedCourses(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Bundles</h1>
          <p className="text-muted-foreground">Group courses into discounted bundles</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Add Bundle</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Bundle" : "Create Bundle"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div>
                <Label>Bundle Price ($)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div>
                <Label className="mb-2 block">Included Courses</Label>
                <div className="space-y-2 max-h-48 overflow-y-auto rounded-lg border border-border p-3">
                  {courses?.map(course => (
                    <label key={course.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer">
                      <Checkbox
                        checked={selectedCourses.includes(course.id)}
                        onCheckedChange={() => toggleCourse(course.id)}
                      />
                      <span className="text-sm flex-1">{course.title}</span>
                      <span className="text-xs text-muted-foreground">${course.price}</span>
                    </label>
                  ))}
                </div>
                {selectedCourses.length > 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {selectedCourses.length} course(s) selected — Total value: $
                    {courses?.filter(c => selectedCourses.includes(c.id)).reduce((s, c) => s + c.price, 0).toFixed(2)}
                  </p>
                )}
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
                  <TableHead>Bundle</TableHead>
                  <TableHead>Courses</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bundles?.map(bundle => (
                  <TableRow key={bundle.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        <span className="font-medium">{bundle.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{bundleCourseMap?.[bundle.id]?.length || 0} courses</Badge>
                    </TableCell>
                    <TableCell className="font-medium">${bundle.price}</TableCell>
                    <TableCell>
                      <Switch
                        checked={bundle.is_active}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: bundle.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(bundle)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(bundle.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {bundles?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No bundles yet. Create your first bundle!
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
