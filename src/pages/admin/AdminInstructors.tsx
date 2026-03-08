import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import type { Json } from "@/integrations/supabase/types";

interface InstructorForm {
  name: string;
  title: string;
  bio: string;
  avatar_url: string;
  specialties: string[];
  github_url: string;
  linkedin_url: string;
  twitter_url: string;
  is_active: boolean;
  sort_order: number;
}

const emptyForm: InstructorForm = {
  name: "", title: "", bio: "", avatar_url: "",
  specialties: [], github_url: "", linkedin_url: "", twitter_url: "",
  is_active: true, sort_order: 0,
};

const parseSpecialties = (s: Json): string[] => {
  if (Array.isArray(s)) return s.filter((v): v is string => typeof v === "string");
  return [];
};

export default function AdminInstructors() {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<InstructorForm>(emptyForm);
  const [newSpecialty, setNewSpecialty] = useState("");

  const { data: instructors, isLoading } = useQuery({
    queryKey: ["admin-instructors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("instructors").select("*").order("sort_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (values: InstructorForm & { id?: string }) => {
      const { id, ...rest } = values;
      const payload = {
        ...rest,
        avatar_url: rest.avatar_url || null,
        github_url: rest.github_url || null,
        linkedin_url: rest.linkedin_url || null,
        twitter_url: rest.twitter_url || null,
        specialties: rest.specialties as unknown as Json,
      };
      if (id) {
        const { error } = await supabase.from("instructors").update(payload).eq("id", id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("instructors").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
      toast.success(editingId ? "Instructor updated" : "Instructor added");
      closeDialog();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("instructors").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-instructors"] });
      toast.success("Instructor deleted");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const closeDialog = () => { setDialogOpen(false); setEditingId(null); setForm(emptyForm); setNewSpecialty(""); };

  const openEdit = (t: any) => {
    setEditingId(t.id);
    setForm({
      name: t.name, title: t.title, bio: t.bio,
      avatar_url: t.avatar_url || "",
      specialties: parseSpecialties(t.specialties),
      github_url: t.github_url || "", linkedin_url: t.linkedin_url || "", twitter_url: t.twitter_url || "",
      is_active: t.is_active, sort_order: t.sort_order,
    });
    setDialogOpen(true);
  };

  const addSpecialty = () => {
    const trimmed = newSpecialty.trim();
    if (trimmed && !form.specialties.includes(trimmed)) {
      setForm({ ...form, specialties: [...form.specialties, trimmed] });
    }
    setNewSpecialty("");
  };

  const removeSpecialty = (s: string) => {
    setForm({ ...form, specialties: form.specialties.filter((x) => x !== s) });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(editingId ? { ...form, id: editingId } : form);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Instructors</h1>
          <p className="text-muted-foreground text-sm">Manage the teaching team displayed on the landing page.</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); else setDialogOpen(true); }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setForm(emptyForm); setEditingId(null); }}>
              <Plus className="h-4 w-4 mr-2" /> Add Instructor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit" : "Add"} Instructor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required maxLength={100} />
              </div>
              <div>
                <Label>Title / Role</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={100} />
              </div>
              <div>
                <Label>Bio</Label>
                <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} required maxLength={500} rows={3} />
              </div>
              <div>
                <Label>Avatar URL (optional)</Label>
                <Input value={form.avatar_url} onChange={(e) => setForm({ ...form, avatar_url: e.target.value })} placeholder="https://..." />
              </div>
              <div>
                <Label>Specialties</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newSpecialty}
                    onChange={(e) => setNewSpecialty(e.target.value)}
                    placeholder="e.g. React"
                    maxLength={30}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addSpecialty(); } }}
                  />
                  <Button type="button" variant="secondary" size="sm" onClick={addSpecialty}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {form.specialties.map((s) => (
                    <Badge key={s} variant="secondary" className="gap-1">
                      {s}
                      <button type="button" onClick={() => removeSpecialty(s)}><X className="h-3 w-3" /></button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label className="text-xs">GitHub URL</Label>
                  <Input value={form.github_url} onChange={(e) => setForm({ ...form, github_url: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label className="text-xs">LinkedIn URL</Label>
                  <Input value={form.linkedin_url} onChange={(e) => setForm({ ...form, linkedin_url: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label className="text-xs">Twitter URL</Label>
                  <Input value={form.twitter_url} onChange={(e) => setForm({ ...form, twitter_url: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Sort Order</Label>
                  <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} />
                  <Label>Active</Label>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingId ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Specialties</TableHead>
                <TableHead>Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {instructors?.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.sort_order}</TableCell>
                  <TableCell className="font-medium">{t.name}</TableCell>
                  <TableCell className="text-muted-foreground">{t.title}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {parseSpecialties(t.specialties).map((s) => (
                        <Badge key={s} variant="secondary" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                      {t.is_active ? "Yes" : "No"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!instructors?.length && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">No instructors yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
