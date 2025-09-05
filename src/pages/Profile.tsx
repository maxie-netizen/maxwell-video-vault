import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Upload, User, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useUsernameValidation } from "@/hooks/useUsernameValidation";
import RecentVideos from "@/components/RecentVideos";

const Profile = () => {
  const { user, profile, logout, refreshProfile } = useAuth() || {};
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    bio: "",
    auto_hide_player: true
  });

  const { isValid: isUsernameValid, message: usernameMessage, color: usernameColor, isChecking } = useUsernameValidation(
    formData.username, 
    profile?.username
  );

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || "",
        bio: profile.bio || "",
        auto_hide_player: profile.auto_hide_player ?? true
      });
    }
  }, [profile]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate username before updating
    if (formData.username && formData.username !== profile?.username && !isUsernameValid) {
      toast.error("Please choose a valid username");
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: formData.username,
          bio: formData.bio,
          auto_hide_player: formData.auto_hide_player
        })
        .eq("id", user.id);

      if (error) throw error;
      
      // Refresh profile to get updated data
      if (refreshProfile) {
        await refreshProfile();
      }
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Error updating profile:", error);
      if (error.code === '23505') {
        toast.error("Username is already taken");
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file size (max 1MB for base64 efficiency)
    if (file.size > 1 * 1024 * 1024) {
      toast.error("File size must be less than 1MB for best performance");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file");
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    setLoading(true);
    try {
      // Convert image to base64 (reliable method)
      const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
      };

      console.log('Converting image to base64...');
      const base64Data = await convertToBase64(file);
      
      console.log('Updating profile with base64 avatar...');
      
      // Try direct update first
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: base64Data })
        .eq("id", user.id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        
        // If RLS error, try using RPC function
        if (updateError.message?.includes('recursion') || updateError.message?.includes('policy') || updateError.message?.includes('RLS')) {
          console.log('RLS error detected, trying RPC function...');
          
          // Try using the RPC function as fallback
          const { error: rpcError } = await supabase.rpc('update_user_avatar_simple', {
            user_id: user.id,
            avatar_data: base64Data
          });
          
          if (rpcError) {
            console.error('RPC error:', rpcError);
            throw new Error('Unable to update avatar. Please try again later.');
          }
          
          console.log('Avatar updated successfully via RPC function');
        } else {
          throw updateError;
        }
      } else {
        console.log('Avatar updated successfully via direct update');
      }
      
      console.log('Profile updated successfully');
      
      // Refresh profile to show new avatar
      if (refreshProfile) {
        await refreshProfile();
      }
      
      // Clean up preview URL
      URL.revokeObjectURL(preview);
      setPreviewUrl(null);
      
      toast.success("Avatar updated successfully!");
      
    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      
      // Clean up preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      
      // Provide more specific error messages
      if (error.message?.includes('permission')) {
        toast.error("Permission denied. Please contact support.");
      } else if (error.message?.includes('size')) {
        toast.error("File too large. Please choose a smaller image.");
      } else if (error.message?.includes('network')) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error(`Failed to upload avatar: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">Please sign in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
          <CardDescription>Manage your account settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Recent Videos Section */}
          <RecentVideos />
          
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={previewUrl || profile?.avatar_url || ""} />
              <AvatarFallback>
                <User className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <Button variant="outline" size="sm" disabled={loading} asChild>
                  <div>
                    <Upload className="h-4 w-4 mr-2" />
                    {loading ? "Uploading..." : "Change Avatar"}
                  </div>
                </Button>
              </Label>
              <Input
                id="avatar"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={loading}
              />
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={user.email || ""}
                disabled
                className="bg-muted"
              />
            </div>

            <div>
              <Label htmlFor="username">Username</Label>
              <div className="space-y-2">
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username (minimum 4 characters)"
                />
                {usernameMessage && (
                  <div className="flex items-center gap-2 text-sm">
                    {isChecking ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : usernameColor === 'success' ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : usernameColor === 'destructive' ? (
                      <XCircle className="h-4 w-4 text-red-600" />
                    ) : null}
                    <span className={
                      usernameColor === 'success' ? 'text-green-600' :
                      usernameColor === 'destructive' ? 'text-red-600' :
                      'text-muted-foreground'
                    }>
                      {usernameMessage}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="auto_hide_player"
                checked={formData.auto_hide_player}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, auto_hide_player: checked })
                }
              />
              <Label htmlFor="auto_hide_player">
                Auto-hide mini player when video ends
              </Label>
            </div>

            <Button type="submit" disabled={updating}>
              {updating ? "Updating..." : "Update Profile"}
            </Button>
          </form>

          <div className="pt-4 border-t">
            <Button variant="destructive" onClick={logout}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;