import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Loader2, Camera, Save, Mail, Calendar, Lock } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  user: any;
  profile: { full_name: string; avatar_url: string | null };
  setProfile: React.Dispatch<React.SetStateAction<{ full_name: string; avatar_url: string | null }>>;
  isEmailUser: boolean;
}

export function ProfileSettings({ user, profile, setProfile, isEmailUser }: Props) {
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: profile.full_name, avatar_url: profile.avatar_url })
        .eq("user_id", user.id);
      if (error) throw error;
      await supabase.auth.updateUser({
        data: { full_name: profile.full_name, avatar_url: profile.avatar_url },
      });
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select an image file"); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image must be less than 2MB"); return; }

    setIsUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("course-thumbnails")
        .upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from("course-thumbnails").getPublicUrl(filePath);
      setProfile((prev) => ({ ...prev, avatar_url: publicUrl }));
      toast.success("Avatar uploaded! Don't forget to save.");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload avatar");
    } finally {
      setIsUploading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) { toast.error("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
    setIsChangingPassword(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });
      if (signInError) { toast.error("Current password is incorrect"); return; }
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Password updated successfully!");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const userInitials = profile.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative group">
          <Avatar className="h-28 w-28 border-2 border-primary/20">
            <AvatarImage src={profile.avatar_url || undefined} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">{userInitials}</AvatarFallback>
          </Avatar>
          <label
            htmlFor="avatar-upload"
            className="absolute inset-0 flex items-center justify-center bg-background/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            {isUploading ? <Loader2 className="h-6 w-6 animate-spin text-primary" /> : <Camera className="h-6 w-6 text-primary" />}
          </label>
          <input id="avatar-upload" type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
        </div>
        <p className="text-xs text-muted-foreground">Click avatar to upload (max 2MB)</p>
      </div>

      <Separator />

      {/* Profile Info */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" value={profile.full_name} onChange={(e) => setProfile((prev) => ({ ...prev, full_name: e.target.value }))} placeholder="Enter your full name" className="bg-muted/50" />
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" />Email</Label>
          <Input value={user?.email || ""} disabled className="bg-muted/30 text-muted-foreground cursor-not-allowed" />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>
        <div className="space-y-2">
          <Label className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />Member Since</Label>
          <Input value={user?.created_at ? format(new Date(user.created_at), "MMMM d, yyyy") : ""} disabled className="bg-muted/30 text-muted-foreground cursor-not-allowed" />
        </div>
      </div>

      <Button onClick={handleSave} disabled={isSaving} className="w-full py-6 box-glow">
        {isSaving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
        Save Changes
      </Button>

      {/* Password */}
      {isEmailUser && (
        <>
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lock className="h-5 w-5 text-muted-foreground" />Change Password
            </h3>
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input id="currentPassword" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="••••••••" className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input id="newPassword" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" minLength={6} className="bg-muted/50" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" minLength={6} className="bg-muted/50" />
            </div>
            <Button onClick={handleChangePassword} disabled={isChangingPassword || !currentPassword || !newPassword || !confirmPassword} variant="outline" className="w-full py-6">
              {isChangingPassword ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Lock className="h-5 w-5 mr-2" />}
              Update Password
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
