'use client'
import { useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  CheckCircle2, DollarSign,
  TrendingUp, BarChart2, Award, Layers,
} from 'lucide-react'
import { useSubmissions } from '@/hooks/use-submissions'
import { useTasks } from '@/hooks/use-tasks'
import { getTaskTypeLabel } from '@/lib/mock-data'
import { getActivePhase, getDripState } from '@/lib/phases'
import type { Submission, Task, User } from '@/types/types'
import { SubmissionDetailDialog, SubmissionRow } from '../submission'
import { RowSkeleton, StatCardSkeleton } from './skeleton'
import { ActiveTaskCard } from './active-task-card'

// ── Types ─────────────────────────────────────────────────────────────────────
interface EnrichedSubmission extends Submission {
  task: Task | null
  phase: { phaseName: string; phaseIndex: number; reward: number } | null
}

// ── Main component ────────────────────────────────────────────────────────────
export default function WorkerMetrics({ user }: { user: User }) {
  const [selectedSubmission, setSelectedSubmission] = useState<EnrichedSubmission | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const { data: allSubmissions, isPending: subsPending } = useSubmissions(
    [{ field: 'workerId', value: user.id }]
  )
  const { data: tasks, isPending: tasksPending } = useTasks()

  const isPending = subsPending || tasksPending

  // ── Enriched submissions ──────────────────────────────────────────────────
  const enriched = useMemo<EnrichedSubmission[]>(() => {
    if (!allSubmissions || !tasks) return []
    return allSubmissions.map((s) => {
      const task = tasks.find((t) => t.id === s.taskId) ?? null
      const phase = s.phaseId && task?.phases
        ? task.phases.find((p) => p.id === s.phaseId) ?? null
        : null
      return {
        ...s,
        task,
        phase: phase
          ? { phaseName: phase.phaseName, phaseIndex: phase.phaseIndex, reward: phase.reward }
          : null,
      }
    })
  }, [allSubmissions, tasks])

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (!enriched.length) return null

    const approved = enriched.filter((s) => s.status === 'approved')
    const rejected = enriched.filter((s) => s.status === 'rejected')
    const pending = enriched.filter((s) => s.status === 'pending')

    // Income: use phase reward if submission is phase-linked, else task reward
    const income = approved.reduce((sum, s) => {
      const reward = s.phase?.reward ?? s.task?.reward ?? 0
      return sum + reward
    }, 0)

    // Pending potential
    const potential = pending.reduce((sum, s) => {
      const reward = s.phase?.reward ?? s.task?.reward ?? 0
      return sum + reward
    }, 0)

    // Top task type
    const typeCounts = enriched.reduce<Record<string, number>>((acc, s) => {
      if (s.task) acc[s.task.type] = (acc[s.task.type] || 0) + 1
      return acc
    }, {})
    const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]

    // Phase participation
    const phaseSubmissions = enriched.filter((s) => s.phaseId)
    const uniquePhaseTaskIds = new Set(phaseSubmissions.map((s) => s.taskId))

    // Streak: consecutive days with at least one submission
    const days = Array.from(
      new Set(enriched.map((s) => new Date(s.submittedAt).toDateString()))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

    let streak = 0
    let cursor = new Date()
    cursor.setHours(0, 0, 0, 0)
    for (const day of days) {
      const d = new Date(day)
      d.setHours(0, 0, 0, 0)
      const diff = Math.round((cursor.getTime() - d.getTime()) / 86400000)
      if (diff <= 1) { streak++; cursor = d } else break
    }

    return {
      approved, rejected, pending, income, potential,
      topType, typeCounts, phaseSubmissions, uniquePhaseTaskIds, streak,
    }
  }, [enriched])

  // ── Tasks with open phases/slots for this worker ──────────────────────────
  const activeCampaigns = useMemo(() => {
    if (!tasks || !allSubmissions) return []
    return tasks
      .filter((t) => t.status === 'active')
      .filter((t) => {
        const activePhase = getActivePhase(t)
        if (t.phases?.length && !activePhase) return false
        return true
      })
      .map((t) => ({
        task: t,
        userCount: allSubmissions.filter((s) => s.taskId === t.id).length,
      }))
      .filter(({ task, userCount }) =>
        task.allowMultipleSubmissions || userCount === 0
      )
      .slice(0, 4)
  }, [tasks, allSubmissions])

  const handleRowClick = (s: EnrichedSubmission) => {
    setSelectedSubmission(s)
    setDialogOpen(true)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Performance</h1>
        <p className="mt-1 text-slate-500 text-sm">Your submission history and earnings overview</p>
      </div>

      {/* ── Top stat cards ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {isPending ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : (
          <>
            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Submitted</p>
                    <p className="mt-1.5 text-3xl font-bold">{enriched.length}</p>
                  </div>
                  <div className="rounded-lg bg-blue-50 p-2.5">
                    <BarChart2 className="h-5 w-5 text-blue-600" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stats?.streak ? `${stats.streak}-day streak 🔥` : 'All time'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Earned</p>
                    <p className="mt-1.5 text-3xl font-bold text-green-700">
                      ${stats?.income ?? 0}
                    </p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-2.5">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stats?.potential
                    ? `+$${stats.potential} pending approval`
                    : 'From approved submissions'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Approval Rate</p>
                    <p className="mt-1.5 text-3xl font-bold text-emerald-600">
                      {enriched.length
                        ? `${Math.round(((stats?.approved.length ?? 0) / enriched.length) * 100)}%`
                        : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-2.5">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stats?.approved.length ?? 0} approved · {stats?.rejected.length ?? 0} rejected
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Top Category</p>
                    <p className="mt-1.5 text-sm font-bold leading-tight">
                      {stats?.topType ? getTaskTypeLabel(stats.topType[0] as any) : '—'}
                    </p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-2.5">
                    <Award className="h-5 w-5 text-purple-600" />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {stats?.topType ? `${stats.topType[1]} submissions` : 'No data yet'}
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* ── Status breakdown + phase stats ────────────────────────────────── */}
      {!isPending && stats && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Status breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Submission Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'Approved', count: stats.approved.length, total: enriched.length, color: 'bg-emerald-500', textColor: 'text-emerald-600' },
                { label: 'Pending', count: stats.pending.length, total: enriched.length, color: 'bg-amber-400', textColor: 'text-amber-600' },
                { label: 'Rejected', count: stats.rejected.length, total: enriched.length, color: 'bg-destructive', textColor: 'text-destructive' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={`font-medium ${item.textColor}`}>{item.label}</span>
                    <span className="text-muted-foreground">{item.count} / {item.total}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${item.color} transition-all`}
                      style={{ width: `${item.total ? (item.count / item.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Phase participation */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Phase Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats.phaseSubmissions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No phase submissions yet.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-primary/5 p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{stats.phaseSubmissions.length}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Phase submissions</p>
                    </div>
                    <div className="rounded-lg bg-primary/5 p-3 text-center">
                      <p className="text-2xl font-bold text-primary">{stats.uniquePhaseTaskIds.size}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Campaigns joined</p>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    {Array.from(stats.uniquePhaseTaskIds).map((taskId) => {
                      const t = tasks?.find((t) => t.id === taskId)
                      const count = stats.phaseSubmissions.filter((s) => s.taskId === taskId).length
                      if (!t) return null
                      return (
                        <div key={taskId} className="flex items-center justify-between text-xs">
                          <span className="truncate text-muted-foreground max-w-[70%]">{t.title}</span>
                          <span className="font-medium shrink-0">{count} submission{count > 1 ? 's' : ''}</span>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── Available campaigns ───────────────────────────────────────────── */}
      {!isPending && activeCampaigns.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" /> Open for Submission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {activeCampaigns.map(({ task, userCount }) => (
                <ActiveTaskCard key={task.id} task={task} userSubmissionCount={userCount} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Submission history ────────────────────────────────────────────── */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-muted-foreground" /> Submission History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {isPending ? (
            Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)
          ) : enriched.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              No submissions yet — head to the task feed to get started!
            </p>
          ) : (
            enriched
              .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime())
              .map((s) => (
                <SubmissionRow key={s.id} submission={s} onClick={() => handleRowClick(s)} />
              ))
          )}
        </CardContent>
      </Card>

      {/* ── Submission detail dialog ──────────────────────────────────────── */}
      <SubmissionDetailDialog
        submission={selectedSubmission}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  )
}