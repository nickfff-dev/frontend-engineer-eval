"use client";
import { useState, useEffect, useRef } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2, Camera } from "lucide-react";
import { toast } from "sonner";
import type { User, UserRole } from "@/types/types";
import { getSubmissionStatusBadgeColor } from "@/lib/mock-data";
import { useEditUser } from "@/hooks/use-users";

interface UserDetailsProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDetails({ user, open, onOpenChange }: UserDetailsProps) {
  const { mutate: editUser, isPending } = useEditUser();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    role: "worker" as UserRole,
    status: "active" as User["status"],
    profilePicture: "",
  });

  useEffect(() => {
    if (user) {
      setForm({
        role: user.role,
        status: user.status,
        profilePicture: user.profilePicture,
      });
    }
  }, [user]);

  if (!user) return null;

  const hasChanged =
    form.role !== user.role ||
    form.status !== user.status ||
    form.profilePicture !== user.profilePicture;

  const initials = user.name.split(" ").map((n) => n[0]).join("").toUpperCase();

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setForm((prev) => ({ ...prev, profilePicture: URL.createObjectURL(file) }));
  };

  const handleSave = () => {
    editUser(
      { id: user.id, data: form },
      {
        onSuccess: () => {
          toast.success("User updated successfully");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to update user"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>User Details</DialogTitle>
          <DialogDescription>Viewing profile for {user.name}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <Avatar className="h-16 w-16">
                <AvatarImage src={form.profilePicture} alt={user.name} />
                <AvatarFallback className="text-lg">{initials}</AvatarFallback>
              </Avatar>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Camera className="h-5 w-5 text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*"
                className="hidden" onChange={handleAvatarChange} />
            </div>
            <div>
              <p className="text-lg font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Joined {new Date(user.createdAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Read-only */}
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-xs text-muted-foreground">User ID</p>
            <p className="font-mono text-sm truncate">{user.id}</p>
          </div>

          {/* Editable */}
          <div className="space-y-4 border-t pt-4">
            <p className="text-sm font-medium">Edit User</p>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, role: val as UserRole }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="worker">Worker</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, status: val as User["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <Badge variant={getSubmissionStatusBadgeColor("active")} className="capitalize">active</Badge>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <Badge variant="secondary" className="capitalize">inactive</Badge>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {form.role === "admin" ? (
              <div className="space-y-2 rounded-lg bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">Admin Permissions</p>
                <ul className="text-xs text-blue-800 space-y-1">
                  <li>✓ Create and edit tasks</li>
                  <li>✓ Review submissions</li>
                  <li>✓ Manage users</li>
                  <li>✓ Access reports</li>
                </ul>
              </div>
            ) : (
              <div className="space-y-2 rounded-lg bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-900">Worker Permissions</p>
                <ul className="text-xs text-slate-600 space-y-1">
                  <li>✓ Browse available tasks</li>
                  <li>✓ Submit task completions</li>
                  <li>✓ Manage profile</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasChanged || isPending} className="min-w-25">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}