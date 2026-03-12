'use client'
import TaskComposer from '@/components/task-compose'
import { Unauthenticated } from '@/components/unauthenticated';
import { Unauthorized } from '@/components/unauthorized';
import { useAuth } from '@/context/AuthContext'

export default function TaskComposerPage() {
  const { user } = useAuth();
  if (!user) return <Unauthenticated />
  if (user.role !== 'admin') {
    return <Unauthorized />
  }
  return (
    <TaskComposer />
  )
}
