'use client'
import { useAuth } from '@/context/AuthContext'
import { Unauthenticated } from '@/components/unauthenticated'
import Settings from '@/components/settings'

export default function SettingsPage() {
  const { user } = useAuth()
  if (!user) return <Unauthenticated />
  return <Settings user={user} />
}