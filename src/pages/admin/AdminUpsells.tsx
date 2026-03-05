import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

type UpsellOffer = {
  id: string; title: string; description: string | null;
  price: number; offer_type: string; is_active: boolean; created_at: string;
};

export default function AdminUpsells() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [editing, setEditing] = useState<UpsellOffer | null>(null);
  const [form, setForm] = useState({ title: "", description: "", price: "", offer_type: "order_bump" });

  const { data: offers, isLoading } = useQuery({
    queryKey: ["adminUpsells"],
    queryFn: async () => {
      const { data, error } = await supabase.from("upsell_offers").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data as UpsellOffer[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title, description: form.description || null,
        price: parseFloat(form.price) || 0, offer_type: form.offer_type,
      };
      if (editing) {
        const { error } = await supabase.from("upsell_offers").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("upsell_offers").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUpsells"] });
      toast.success(editing ? "Offer updated" : "Offer created");
      resetForm();
    },
    onError: (e) => toast.error("Failed: " + e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("upsell_offers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUpsells"] });
      toast.success("Offer deleted");
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from("upsell_offers").update({ is_active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["adminUpsells"] }),
  });

  const resetForm = () => {
    setForm({ title: "", description: "", price: "", offer_type: "order_bump" });
    setEditing(null);
    setIsOpen(false);
  };

  const handleEdit = (offer: UpsellOffer) => {
    setEditing(offer);
    setForm({ title: offer.title, description: offer.description || "", price: offer.price.toString(), offer_type: offer.offer_type });
    setIsOpen(true);
  };

  const typeLabel = (t: string) => t === "order_bump" ? "Order Bump" : t === "post_purchase" ? "Post-Purchase" : t;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Upsell Offers</h1>
          <p className="text-muted-foreground">Manage order bumps & post-purchase upsells</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}><Plus className="h-4 w-4 mr-2" />Add Offer</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Offer" : "Create Offer"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="e.g. 1-on-1 Coaching Call" />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} placeholder="What the user gets..." />
              </div>
              <div>
                <Label>Price ($)</Label>
                <Input type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
              </div>
              <div>
                <Label>Offer Type</Label>
                <Select value={form.offer_type} onValueChange={v => setForm({ ...form, offer_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="order_bump">Order Bump (checkbox at checkout)</SelectItem>
                    <SelectItem value="post_purchase">Post-Purchase Upsell (modal after payment)</SelectItem>
                  </SelectContent>
                </Select>
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
                  <TableHead>Offer</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers?.map(offer => (
                  <TableRow key={offer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <div>
                          <span className="font-medium block">{offer.title}</span>
                          {offer.description && <span className="text-xs text-muted-foreground">{offer.description}</span>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={offer.offer_type === "order_bump" ? "default" : "secondary"}>
                        {typeLabel(offer.offer_type)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">${offer.price}</TableCell>
                    <TableCell>
                      <Switch
                        checked={offer.is_active}
                        onCheckedChange={(checked) => toggleMutation.mutate({ id: offer.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(offer)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(offer.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {offers?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No upsell offers yet. Create your first one!
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
