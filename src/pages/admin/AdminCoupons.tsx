import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, Tag } from "lucide-react";
import { toast } from "sonner";

type Coupon = {
  id: string;
  code: string;
  discount_percent: number;
  is_active: boolean;
  max_uses: number | null;
  current_uses: number;
  expires_at: string | null;
  created_at: string;
};

export default function AdminCoupons() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [maxUses, setMaxUses] = useState("");
  const [expiresAt, setExpiresAt] = useState("");

  const { data: coupons, isLoading } = useQuery({
    queryKey: ["adminCoupons"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coupons")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Coupon[];
    },
  });

  const resetForm = () => {
    setCode("");
    setDiscountPercent("");
    setIsActive(true);
    setMaxUses("");
    setExpiresAt("");
    setEditingCoupon(null);
    setIsDialogOpen(false);
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("coupons").insert({
        code: code.toUpperCase().trim(),
        discount_percent: parseInt(discountPercent),
        is_active: isActive,
        max_uses: maxUses ? parseInt(maxUses) : null,
        expires_at: expiresAt || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      toast.success("Coupon created successfully");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!editingCoupon) return;
      const { error } = await supabase
        .from("coupons")
        .update({
          code: code.toUpperCase().trim(),
          discount_percent: parseInt(discountPercent),
          is_active: isActive,
          max_uses: maxUses ? parseInt(maxUses) : null,
          expires_at: expiresAt || null,
        })
        .eq("id", editingCoupon.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      toast.success("Coupon updated successfully");
      resetForm();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminCoupons"] });
      toast.success("Coupon deleted successfully");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setCode(coupon.code);
    setDiscountPercent(String(coupon.discount_percent));
    setIsActive(coupon.is_active);
    setMaxUses(coupon.max_uses ? String(coupon.max_uses) : "");
    setExpiresAt(coupon.expires_at ? coupon.expires_at.split("T")[0] : "");
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCoupon) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Coupons</h1>
          <p className="text-muted-foreground">Manage discount coupon codes</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Coupon</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCoupon ? "Edit Coupon" : "Create Coupon"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="code">Coupon Code</Label>
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. SAVE20" required />
              </div>
              <div>
                <Label htmlFor="discount">Discount (%)</Label>
                <Input id="discount" type="number" min="1" max="100" value={discountPercent} onChange={(e) => setDiscountPercent(e.target.value)} placeholder="e.g. 20" required />
              </div>
              <div>
                <Label htmlFor="maxUses">Max Uses (leave empty for unlimited)</Label>
                <Input id="maxUses" type="number" min="1" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} placeholder="Unlimited" />
              </div>
              <div>
                <Label htmlFor="expiresAt">Expiry Date (optional)</Label>
                <Input id="expiresAt" type="date" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="isActive" checked={isActive} onCheckedChange={setIsActive} />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingCoupon ? "Update" : "Create"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Uses</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons?.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-mono font-semibold">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-primary" />
                      {coupon.code}
                    </div>
                  </TableCell>
                  <TableCell>{coupon.discount_percent}%</TableCell>
                  <TableCell>{coupon.current_uses}/{coupon.max_uses ?? "∞"}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${coupon.is_active ? "bg-green-500/10 text-green-500" : "bg-muted text-muted-foreground"}`}>
                      {coupon.is_active ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString() : "Never"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(coupon)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(coupon.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!coupons || coupons.length === 0) && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No coupons yet. Create your first coupon code.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
