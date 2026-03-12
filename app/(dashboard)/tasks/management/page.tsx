'use client'
import TasksTable from '@/components/task-table'
import { Unauthenticated } from '@/components/unauthenticated';
import { Unauthorized } from '@/components/unauthorized';
import { useAuth } from '@/context/AuthContext'

export default function TaskManagementPage() {
  const { user } = useAuth();
  if (!user) return <Unauthenticated />
  if (user.role !== 'admin') {
    return <Unauthorized />
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Task Management</h1>
        <p className="mt-2 text-slate-600">View and manage all tasks</p>
      </div>
      {/* Tasks Table */}
      <TasksTable />
    </div>
  )
}


