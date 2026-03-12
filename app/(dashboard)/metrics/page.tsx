'use client'
import { useAuth } from '@/context/AuthContext'
import { Unauthenticated } from '@/components/unauthenticated'
import Performance from '@/components/worker-metrics'

export default function PerformancePage() {
  const { user } = useAuth()
  if (!user) return <Unauthenticated />
  return <Performance user={user} />
}