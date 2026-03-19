'use client'
import { useAuth } from '@/context/AuthContext'
import { Unauthenticated } from '@/components/unauthenticated'
import TaskDetailView from '@/components/task-detail'
import { useParams } from 'next/navigation'
import { Unauthorized } from '@/components/unauthorized'

export default function TaskDetailPage() {
    const { user } = useAuth()
    const { id } = useParams<{ id: string }>()
    if (!user) return <Unauthenticated />
    if (user.role !== 'admin') return <Unauthorized />

    return <TaskDetailView taskId={id} />
}