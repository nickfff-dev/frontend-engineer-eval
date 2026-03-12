'use client'
import { useState, useRef, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Camera, Loader2, KeyRound, User, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import type { User as UserType } from '@/types/types'
import { useEditUser } from '@/hooks/use-users'
import { getSubmissionStatusBadgeColor } from '@/lib/mock-data'

interface Session {
  id: string
  user_id: string
  role: string
  createdAt?: Date
}

export default function Settings({ user }: { user: UserType }) {
  const { mutate: editUser, isPending } = useEditUser()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [profilePicture, setProfilePicture] = useState(user.profilePicture)
  const [picChanged, setPicChanged] = useState(false)

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    next: '',
    confirm: '',
  })
  const [passwordPending, setPasswordPending] = useState(false)

  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('session')
      if (stored) setSession(JSON.parse(stored))
    } catch { }
  }, [])

  const initials = user.name.split(' ').map((n) => n[0]).join('').toUpperCase()

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfilePicture(reader.result as string)
      setPicChanged(true)
    }
    reader.readAsDataURL(file)
  }

  const handleSaveProfilePic = () => {
    editUser(
      { id: user.id, data: { profilePicture } },
      {
        onSuccess: () => {
          toast.success('Profile picture updated')
          setPicChanged(false)
        },
        onError: () => toast.error('Failed to update profile picture'),
      }
    )
  }

  const handleChangePassword = async () => {
    if (passwordForm.current !== user.password) {
      toast.error('Current password is incorrect')
      return
    }
    if (passwordForm.next.length < 6) {
      toast.error('New password must be at least 6 characters')
      return
    }
    if (passwordForm.next !== passwordForm.confirm) {
      toast.error('New passwords do not match')
      return
    }
    setPasswordPending(true)
    await new Promise((r) => setTimeout(r, 500))
    editUser(
      { id: user.id, data: { password: passwordForm.next } },
      {
        onSuccess: () => {
          toast.success('Password updated')
          setPasswordForm({ current: '', next: '', confirm: '' })
        },
        onError: () => toast.error('Failed to update password'),
        onSettled: () => setPasswordPending(false),
      }
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-2 text-slate-600">Manage your account preferences</p>
      </div>

      {/* Profile */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
        </div>
        <Separator />

        {/* Avatar */}
        <div className="flex items-center gap-5">
          <div className="relative group">
            <Avatar className="h-20 w-20">
              <AvatarImage src={profilePicture} alt={user.name} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
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
            <p className="font-semibold text-slate-900 text-lg">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge variant={getSubmissionStatusBadgeColor(user.status)} className="capitalize mt-1">
              {user.role}
            </Badge>
          </div>
        </div>

        {picChanged && (
          <Button onClick={handleSaveProfilePic} disabled={isPending} className="w-fit">
            {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Save Profile Picture
          </Button>
        )}

        <Separator />

        {/* Read-only info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Name</p>
            <p className="mt-1 font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Email</p>
            <p className="mt-1 font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Role</p>
            <p className="mt-1 font-medium capitalize">{user.role}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase font-semibold">Status</p>
            <Badge variant={getSubmissionStatusBadgeColor(user.status)} className="capitalize mt-1">
              {user.status}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Password */}
      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-slate-500" />
          <h2 className="text-lg font-semibold text-slate-900">Change Password</h2>
        </div>
        <Separator />

        <div className="space-y-4 max-w-sm">
          <div className="space-y-1.5">
            <Label>Current Password</Label>
            <Input
              type="password"
              value={passwordForm.current}
              onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>New Password</Label>
            <Input
              type="password"
              value={passwordForm.next}
              onChange={(e) => setPasswordForm((p) => ({ ...p, next: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Confirm New Password</Label>
            <Input
              type="password"
              value={passwordForm.confirm}
              onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
            />
          </div>
          <Button
            onClick={handleChangePassword}
            disabled={passwordPending || !passwordForm.current || !passwordForm.next || !passwordForm.confirm}
            className="w-fit"
          >
            {passwordPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update Password
          </Button>
        </div>
      </Card>

      {/* Session */}
      {session && (
        <Card className="p-6 space-y-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-slate-500" />
            <h2 className="text-lg font-semibold text-slate-900">Session Info</h2>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Session ID</p>
              <p className="mt-1 font-mono text-sm truncate">{session.id}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Role</p>
              <p className="mt-1 font-medium capitalize">{session.role}</p>
            </div>
            {session.createdAt && (
              <div>
                <p className="text-xs text-muted-foreground uppercase font-semibold">Started</p>
                <p className="mt-1 font-medium">
                  {new Date(session.createdAt).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}