import { useQuery } from "@tanstack/react-query";
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
import { Loader2, User, Crown } from "lucide-react";
import { format } from "date-fns";

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
  user_id: string;
  role: string;
};

export default function AdminUsers() {
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
        .select("user_id, role");
      if (error) throw error;
      return data as UserRole[];
    },
  });

  const getUserPurchases = (userId: string) => {
    return purchases?.filter((p) => p.user_id === userId) || [];
  };

  const getUserRoles = (userId: string) => {
    return roles?.filter((r) => r.user_id === userId).map((r) => r.role) || [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground">View registered users and their purchases</p>
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
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles?.map((profile) => {
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
                            userRoles.map((role) => (
                              <Badge
                                key={role}
                                variant={role === "admin" ? "default" : "secondary"}
                                className={role === "admin" ? "bg-primary" : ""}
                              >
                                {role === "admin" && <Crown className="h-3 w-3 mr-1" />}
                                {role}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="outline">user</Badge>
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
                    </TableRow>
                  );
                })}
                {profiles?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No users found.
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
