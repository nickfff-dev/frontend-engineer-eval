'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  CheckCircle2, XCircle, Clock, DollarSign,
  TrendingUp, BarChart2, Award,
} from 'lucide-react'
import { useSubmissions } from '@/hooks/use-submissions'
import { useTasks } from '@/hooks/use-tasks'
import { getSubmissionStatusBadgeColor } from '@/lib/mock-data'
import { getTaskTypeLabel } from '@/lib/mock-data'
import type { User } from '@/types/types'

function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6 space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-9 w-16" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

function SubmissionRowSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <Skeleton className="h-6 w-20" />
    </div>
  )
}

export default function Performance({ user }: { user: User }) {
  const { data: allSubmissions, isPending: subsPending } = useSubmissions(
    [{ field: 'workerId', value: user.id }]
  )
  const { data: tasks, isPending: tasksPending } = useTasks()

  const isPending = subsPending || tasksPending

  const stats = useMemo(() => {
    if (!allSubmissions || !tasks) return null

    const approved = allSubmissions.filter((s) => s.status === 'approved')
    const rejected = allSubmissions.filter((s) => s.status === 'rejected')
    const pending = allSubmissions.filter((s) => s.status === 'pending')

    // Total income from approved submissions
    const income = approved.reduce((sum, s) => {
      const task = tasks.find((t) => t.id === s.taskId)
      return sum + (task?.reward ?? 0)
    }, 0)

    // Most common task type
    const typeCounts = allSubmissions.reduce<Record<string, number>>((acc, s) => {
      const task = tasks.find((t) => t.id === s.taskId)
      if (task) acc[task.type] = (acc[task.type] || 0) + 1
      return acc
    }, {})
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]

    return { approved, rejected, pending, income, topType, typeCounts }
  }, [allSubmissions, tasks])

  // Enrich submissions with task info for the table
  const enriched = useMemo(() => {
    if (!allSubmissions || !tasks) return []
    return allSubmissions.map((s) => ({
      ...s,
      task: tasks.find((t) => t.id === s.taskId) ?? null,
    }))
  }, [allSubmissions, tasks])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Performance</h1>
        <p className="mt-1 text-slate-600">Your submission history and earnings overview</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Submitted</p>
                    <p className="mt-2 text-3xl font-bold">{allSubmissions?.length ?? 0}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-3">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">All time submissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Approved</p>
                    <p className="mt-2 text-3xl font-bold text-emerald-600">
                      {stats?.approved.length ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {stats && allSubmissions?.length
                    ? `${Math.round((stats.approved.length / allSubmissions.length) * 100)}% approval rate`
                    : '—'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Earned</p>
                    <p className="mt-2 text-3xl font-bold text-green-700">
                      ${stats?.income ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">From approved submissions</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Top Category</p>
                    <p className="mt-2 text-sm font-bold leading-tight">
                      {stats?.topType
                        ? getTaskTypeLabel(stats.topType[0] as any)
                        : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-3">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  {stats?.topType ? `${stats.topType[1]} submissions` : 'No data yet'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Status breakdown */}
      {!isPending && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[
            { label: 'Approved', count: stats.approved.length, icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />, bg: 'bg-emerald-50' },
            { label: 'Pending', count: stats.pending.length, icon: <Clock className="h-4 w-4 text-sky-600" />, bg: 'bg-sky-50' },
            { label: 'Rejected', count: stats.rejected.length, icon: <XCircle className="h-4 w-4 text-destructive" />, bg: 'bg-red-50' },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`rounded-lg p-2 ${item.bg}`}>{item.icon}</div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-xl font-bold">{item.count}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submissions list */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-5 w-5 text-slate-500" />
            Submission History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => <SubmissionRowSkeleton key={i} />)
          ) : enriched.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No submissions yet. Head to the task feed to get started!
            </p>
          ) : (
            enriched.map((s) => (
              <div key={s.id}
                className="flex items-center justify-between rounded-lg border p-4 hover:bg-slate-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">
                    {s.task?.title ?? s.taskId}
                  </p>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    {s.task && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {getTaskTypeLabel(s.task.type)}
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(s.submittedAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric',
                      })}
                    </span>
                    {s.task && (
                      <span className="text-xs font-medium text-green-700">
                        +${s.task.reward}
                      </span>
                    )}
                  </div>
                </div>
                <Badge
                  variant={getSubmissionStatusBadgeColor(s.status)}
                  className="capitalize ml-4 shrink-0"
                >
                  {s.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}