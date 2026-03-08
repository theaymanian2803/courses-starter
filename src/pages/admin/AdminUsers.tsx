import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, User, Crown, ShieldCheck, UserPlus, Trash2, Search, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { toast } from "sonner";
import { useState } from "react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];

type Profile = {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

type Purchase = {
  user_id: string;
  course_id: string;
  courses?: { title: string };
};

type UserRole = {
  id: string;
  user_id: string;
  role: AppRole;
};

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [roleDialog, setRoleDialog] = useState<{ open: boolean; userId: string; userName: string }>({
    open: false,
    userId: "",
    userName: "",
  });
  const [selectedRole, setSelectedRole] = useState<AppRole>("user");
  const [confirmRemove, setConfirmRemove] = useState<{ open: boolean; roleId: string; role: string; userName: string }>({
    open: false,
    roleId: "",
    role: "",
    userName: "",
  });

  const { data: profiles, isLoading: loadingProfiles } = useQuery({
    queryKey: ["adminProfiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Profile[];
    },
  });

  const { data: purchases } = useQuery({
    queryKey: ["adminPurchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("purchases")
        .select("*, courses(title)");
      if (error) throw error;
      return data as Purchase[];
    },
  });

  const { data: roles } = useQuery({
    queryKey: ["adminUserRoles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("id, user_id, role");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase
        .from("user_roles")
        .insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUserRoles"] });
      toast.success("Role added successfully");
      setRoleDialog({ open: false, userId: "", userName: "" });
    },
    onError: (error: any) => {
      if (error.message?.includes("duplicate")) {
        toast.error("User already has this role");
      } else {
        toast.error("Failed to add role");
      }
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (roleId: string) => {
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("id", roleId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUserRoles"] });
      toast.success("Role removed successfully");
      setConfirmRemove({ open: false, roleId: "", role: "", userName: "" });
    },
    onError: () => {
      toast.error("Failed to remove role");
    },
  });

  const getUserPurchases = (userId: string) => {
    return purchases?.filter((p) => p.user_id === userId) || [];
  };

  const getUserRoles = (userId: string) => {
    return roles?.filter((r) => r.user_id === userId) || [];
  };

  const filteredProfiles = profiles?.filter((profile) => {
    if (!searchQuery) return true;
    const name = (profile.full_name || "").toLowerCase();
    return name.includes(searchQuery.toLowerCase());
  });

  const roleIcon = (role: string) => {
    if (role === "admin") return <Crown className="h-3 w-3 mr-1" />;
    if (role === "moderator") return <ShieldCheck className="h-3 w-3 mr-1" />;
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Users</h1>
          <p className="text-muted-foreground">Manage users, roles, and view purchases</p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loadingProfiles ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Purchases</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles?.map((profile) => {
                  const userPurchases = getUserPurchases(profile.user_id);
                  const userRoles = getUserRoles(profile.user_id);

                  return (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                            {profile.avatar_url ? (
                              <img
                                src={profile.avatar_url}
                                alt={profile.full_name || "User"}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <span className="font-medium">
                            {profile.full_name || "Unnamed User"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {userRoles.length > 0 ? (
                            userRoles.map((r) => (
                              <Badge
                                key={r.id}
                                variant={r.role === "admin" ? "default" : "secondary"}
                                className={`cursor-pointer ${r.role === "admin" ? "bg-primary" : ""}`}
                                onClick={() =>
                                  setConfirmRemove({
                                    open: true,
                                    roleId: r.id,
                                    role: r.role,
                                    userName: profile.full_name || "Unnamed User",
                                  })
                                }
                              >
                                {roleIcon(r.role)}
                                {r.role}
                                <Trash2 className="h-3 w-3 ml-1 opacity-60" />
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">no roles</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {userPurchases.length > 0 ? (
                          <div className="flex flex-col gap-1">
                            {userPurchases.map((purchase, idx) => (
                              <Badge key={idx} variant="secondary">
                                {purchase.courses?.title || "Course"}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">No purchases</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(profile.created_at), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setRoleDialog({
                              open: true,
                              userId: profile.user_id,
                              userName: profile.full_name || "Unnamed User",
                            })
                          }
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add Role
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filteredProfiles?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No users found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Add Role Dialog */}
      <Dialog open={roleDialog.open} onOpenChange={(open) => setRoleDialog((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Role</DialogTitle>
            <DialogDescription>
              Assign a role to <strong>{roleDialog.userName}</strong>
            </DialogDescription>
          </DialogHeader>
          <Select value={selectedRole} onValueChange={(v) => setSelectedRole(v as AppRole)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="moderator">Moderator</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRoleDialog((prev) => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button
              onClick={() => addRoleMutation.mutate({ userId: roleDialog.userId, role: selectedRole })}
              disabled={addRoleMutation.isPending}
            >
              {addRoleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Add Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Remove Role Dialog */}
      <Dialog open={confirmRemove.open} onOpenChange={(open) => setConfirmRemove((prev) => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Role</DialogTitle>
            <DialogDescription>
              Remove the <strong>{confirmRemove.role}</strong> role from <strong>{confirmRemove.userName}</strong>?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmRemove((prev) => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => removeRoleMutation.mutate(confirmRemove.roleId)}
              disabled={removeRoleMutation.isPending}
            >
              {removeRoleMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
