'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTasks, useEditTask } from '@/hooks/use-tasks'
import { useSubmissions } from '@/hooks/use-submissions'
import { getTaskTypeLabel, getSubmissionStatusBadgeColor, getTaskSlots } from '@/lib/mock-data'
import { getActivePhase } from '@/lib/phases'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import {
    ArrowLeft, Pencil, Save, X, Layers,
    Droplets, FileText, Users, CheckCircle2,
    Clock, XCircle, DollarSign,
} from 'lucide-react'
import { toast } from 'sonner'
import { PhaseBuilder } from '@/components/phases/phase-builder'
import { DripFeedConfig } from '@/components/drip/drip-feed-config'
import { PhaseProgress } from '@/components/phases/phase-progress'
import { DripStatus } from '@/components/drip/drip-status'
import { MarkdownEditor } from '@/components/markdown-editor'
import type { DripFeed, Submission, Task, TaskPhase } from '@/types/types'
import ReactMarkdown from 'react-markdown'
// ── Submission status icon ────────────────────────────────────────────────────

function StatusIcon({ status }: { status: string }) {
    if (status === 'approved') return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    if (status === 'rejected') return <XCircle className="h-4 w-4 text-destructive" />
    return <Clock className="h-4 w-4 text-amber-500" />
}

// ── Submission row ────────────────────────────────────────────────────────────

function SubmissionRow({ submission }: { submission: Submission }) {
    return (
        <div className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/30 transition-colors">
            <div className="flex items-center gap-3 min-w-0">
                <StatusIcon status={submission.status} />
                <div className="min-w-0">
                    <p className="text-sm font-mono truncate text-muted-foreground">
                        {submission.workerId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                        {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                        })}
                        {submission.phaseId && (
                            <span className="ml-2 text-primary">· {submission.phaseId}</span>
                        )}
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
                <Badge
                    variant={getSubmissionStatusBadgeColor(submission.status)}
                    className="capitalize text-xs"
                >
                    {submission.status}
                </Badge>
                {submission.data.postUrl && (
                    <a
                        href={submission.data.postUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline hidden sm:block"
                    >
                        View post
                    </a>
                )}
                {submission.data.evidenceScreenshot && (
                    <img
                        src={submission.data.evidenceScreenshot}
                        alt="evidence"
                        className="h-8 w-8 rounded object-cover border"
                    />
                )}
            </div>
        </div>
    )
}

// ── Editable field wrapper ─────────────────────────────────────────────────────

function EditableSection({
    label,
    children,
    isEditing,
    onEdit,
    onCancel,
}: {
    label: string
    children: React.ReactNode
    isEditing: boolean
    onEdit: () => void
    onCancel: () => void
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</Label>
                {!isEditing ? (
                    <Button type="button" size="sm" variant="ghost" className="h-6 gap-1 text-xs" onClick={onEdit}>
                        <Pencil className="h-3 w-3" /> Edit
                    </Button>
                ) : (
                    <Button type="button" size="sm" variant="ghost" className="h-6 gap-1 text-xs text-muted-foreground" onClick={onCancel}>
                        <X className="h-3 w-3" /> Cancel
                    </Button>
                )}
            </div>
            {children}
        </div>
    )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function TaskDetailView({ taskId }: { taskId: string }) {
    const router = useRouter()
    const { data: allTasks, isPending: tasksPending } = useTasks()
    const { data: allSubmissions, isPending: subsPending } = useSubmissions()
    const { mutate: editTask, isPending: isSaving } = useEditTask()

    const task = allTasks?.find((t) => t.id === taskId) ?? null
    const submissions = allSubmissions?.filter((s) => s.taskId === taskId) ?? []

    // ── Local edit state ──────────────────────────────────────────────────────
    const [form, setForm] = useState({
        status: 'active' as Task['status'],
        details: '',
        amount: 0,
        reward: 0,
        phases: [] as TaskPhase[],
        dripFeed: { enabled: false, dripAmount: 10, dripInterval: 60, totalReleased: 0 } as DripFeed,
    })

    const [editingField, setEditingField] = useState<string | null>(null)
    const [editingDetails, setEditingDetails] = useState(false)

    useEffect(() => {
        if (task) {
            setForm({
                status: task.status,
                details: task.details,
                amount: task.amount,
                reward: task.reward,
                phases: task.phases ?? [],
                dripFeed: task.dripFeed ?? { enabled: false, dripAmount: 10, dripInterval: 60, totalReleased: 0 },
            })
        }
    }, [task])

    const handleSave = (fields: Partial<typeof form>) => {
        if (!task) return
        const updated = { ...form, ...fields }
        editTask(
            { id: task.id, data: updated },
            {
                onSuccess: () => {
                    toast.success('Task updated')
                    setEditingField(null)
                },
                onError: () => toast.error('Failed to update task'),
            }
        )
    }

    // ── Loading ───────────────────────────────────────────────────────────────

    if (tasksPending) return (
        <div className="space-y-6 max-w-5xl">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-48 w-full" />
        </div>
    )

    if (!task) return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <XCircle className="h-10 w-10 text-destructive" />
            <p>Task not found.</p>
            <Button variant="outline" onClick={() => router.back()}>Go back</Button>
        </div>
    )

    const { maxSlots, slotsRemaining, isFull } = getTaskSlots(task)
    const activePhase = getActivePhase(task)

    // Per-phase submission breakdown
    const submissionsByPhase = task.phases?.reduce<Record<string, typeof submissions>>(
        (acc, phase) => {
            acc[phase.id] = submissions.filter((s) => s.phaseId === phase.id)
            return acc
        },
        {}
    ) ?? {}
    const unphased = submissions.filter((s) => !s.phaseId)

    const approvedCount = submissions.filter((s) => s.status === 'approved').length
    const pendingCount = submissions.filter((s) => s.status === 'pending').length
    const rejectedCount = submissions.filter((s) => s.status === 'rejected').length

    return (
        <div className="space-y-6 max-w-5xl pb-12">
            {/* ── Header ─────────────────────────────────────────────────────────── */}
            <div className="flex items-start gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.back()} className="mt-1 shrink-0">
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold text-slate-900 truncate">{task.title}</h1>
                        <Badge variant={getSubmissionStatusBadgeColor(task.status)} className="capitalize shrink-0">
                            {task.status}
                        </Badge>
                        {task.phases?.length && (
                            <Badge variant="outline" className="gap-1 shrink-0">
                                <Layers className="h-3 w-3" /> {task.phases.length} phases
                            </Badge>
                        )}
                        {task.dripFeed?.enabled && (
                            <Badge variant="outline" className="gap-1 shrink-0">
                                <Droplets className="h-3 w-3" /> Drip feed
                            </Badge>
                        )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    {task.campaignId && (
                        <p className="text-xs text-muted-foreground">Campaign: {task.campaignId}</p>
                    )}
                </div>
            </div>

            {/* ── Stats row ──────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                    { label: 'Total Slots', value: maxSlots, icon: <Users className="h-4 w-4 text-blue-500" />, bg: 'bg-blue-50' },
                    { label: 'Remaining', value: isFull ? 'Full' : slotsRemaining, icon: <Clock className="h-4 w-4 text-amber-500" />, bg: 'bg-amber-50' },
                    { label: 'Reward', value: `$${activePhase?.reward ?? task.reward}`, icon: <DollarSign className="h-4 w-4 text-green-600" />, bg: 'bg-green-50' },
                    { label: 'Submissions', value: submissions.length, icon: <FileText className="h-4 w-4 text-primary" />, bg: 'bg-primary/10' },
                ].map((stat) => (
                    <Card key={stat.label}>
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`rounded-lg p-2 ${stat.bg} shrink-0`}>{stat.icon}</div>
                            <div>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                                <p className="text-lg font-bold">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ── Main tabs ──────────────────────────────────────────────────────── */}
            <Tabs defaultValue="overview">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="submissions">
                        Submissions
                        {submissions.length > 0 && (
                            <Badge variant="secondary" className="ml-2 text-xs">{submissions.length}</Badge>
                        )}
                    </TabsTrigger>
                    {task.phases?.length && (
                        <TabsTrigger value="phases">
                            Phases
                            <Badge variant="secondary" className="ml-2 text-xs">{task.phases.length}</Badge>
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>

                {/* ── Overview tab ─────────────────────────────────────────────────── */}
                <TabsContent value="overview" className="space-y-4 pt-4">
                    {/* Drip status */}
                    {task.dripFeed?.enabled && <DripStatus task={task} />}

                    {/* Phase progress summary */}
                    {task.phases?.length && (
                        <Card>
                            <CardHeader className="pb-3">
                                <CardTitle className="text-sm flex items-center gap-2">
                                    <Layers className="h-4 w-4" /> Phase Progress
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <PhaseProgress phases={task.phases} />
                            </CardContent>
                        </Card>
                    )}

                    {/* Task details rendered as markdown */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Task Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="prose prose-sm max-w-none">
                                {task.details}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Read-only metadata */}
                    <Card>
                        <CardContent className="pt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Type</p>
                                <p className="font-medium text-sm capitalize">{getTaskTypeLabel(task.type)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Multiple Submissions</p>
                                <p className="font-medium text-sm">{task.allowMultipleSubmissions ? 'Allowed' : 'Not allowed'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Created</p>
                                <p className="font-medium text-sm">
                                    {new Date(task.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric', month: 'short', day: 'numeric',
                                    })}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Amount</p>
                                <p className="font-medium text-sm">${task.amount}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Reward</p>
                                <p className="font-medium text-sm">${task.reward}</p>
                            </div>
                            {task.campaignId && (
                                <div>
                                    <p className="text-xs text-muted-foreground">Campaign</p>
                                    <p className="font-medium text-sm">{task.campaignId}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ── Submissions tab ───────────────────────────────────────────────── */}
                <TabsContent value="submissions" className="space-y-4 pt-4">
                    {/* Status summary */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Approved', count: approvedCount, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, bg: 'bg-emerald-50' },
                            { label: 'Pending', count: pendingCount, icon: <Clock className="h-4 w-4 text-amber-500" />, bg: 'bg-amber-50' },
                            { label: 'Rejected', count: rejectedCount, icon: <XCircle className="h-4 w-4 text-destructive" />, bg: 'bg-red-50' },
                        ].map((item) => (
                            <Card key={item.label}>
                                <CardContent className="p-3 flex items-center gap-2">
                                    <div className={`rounded p-1.5 ${item.bg}`}>{item.icon}</div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">{item.label}</p>
                                        <p className="text-lg font-bold">{item.count}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {subsPending ? (
                        <div className="space-y-2">
                            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                            <FileText className="h-8 w-8" />
                            <p className="text-sm">No submissions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {submissions.map((s) => <SubmissionRow key={s.id} submission={s} />)}
                        </div>
                    )}
                </TabsContent>

                {/* ── Phases tab ───────────────────────────────────────────────────── */}
                {task.phases?.length && (
                    <TabsContent value="phases" className="space-y-4 pt-4">
                        {task.phases.map((phase) => {
                            const phaseSubs = submissionsByPhase[phase.id] ?? []
                            const pct = phase.slots > 0
                                ? Math.round((phase.submissionsReceived / phase.slots) * 100)
                                : 0
                            const phaseApproved = phaseSubs.filter((s) => s.status === 'approved').length
                            const phasePending = phaseSubs.filter((s) => s.status === 'pending').length

                            return (
                                <Card key={phase.id} className={phase.status === 'pending' ? 'opacity-60' : ''}>
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between flex-wrap gap-2">
                                            <CardTitle className="text-sm flex items-center gap-2">
                                                <Layers className="h-4 w-4 text-primary" />
                                                Phase {phase.phaseIndex} — {phase.phaseName}
                                            </CardTitle>
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-semibold text-green-700">${phase.reward}</span>
                                                <Badge
                                                    variant={
                                                        phase.status === 'completed' ? 'default'
                                                            : phase.status === 'active' ? 'secondary'
                                                                : 'outline'
                                                    }
                                                    className="capitalize text-xs"
                                                >
                                                    {phase.status}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {/* Progress */}
                                        <div className="space-y-1.5">
                                            <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>{phase.submissionsReceived} / {phase.slots} slots</span>
                                                <span>{pct}%</span>
                                            </div>
                                            <Progress value={pct} className="h-2" />
                                        </div>

                                        {/* Instructions */}
                                        {phase.instructions && (
                                            <div>
                                                <p className="text-xs text-muted-foreground mb-1">Instructions</p>
                                                <p className="text-sm bg-muted/30 rounded-lg p-3">{phase.instructions}</p>
                                            </div>
                                        )}

                                        {/* Phase submissions */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs text-muted-foreground">
                                                    Submissions — {phaseApproved} approved · {phasePending} pending
                                                </p>
                                            </div>
                                            {phaseSubs.length === 0 ? (
                                                <p className="text-xs text-muted-foreground italic py-2">No submissions for this phase yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    {phaseSubs.map((s) => <SubmissionRow key={s.id} submission={s} />)}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        })}

                        {/* Unphased submissions if any */}
                        {unphased.length > 0 && (
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-sm text-muted-foreground">Unphased Submissions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    {unphased.map((s) => <SubmissionRow key={s.id} submission={s} />)}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                )}

                {/* ── Edit tab ─────────────────────────────────────────────────────── */}
                <TabsContent value="edit" className="space-y-6 pt-4">
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            {/* Status */}
                            <div className="space-y-1.5">
                                <Label>Status</Label>
                                <Select
                                    value={form.status}
                                    onValueChange={(val) => setForm((p) => ({ ...p, status: val as Task['status'] }))}
                                >
                                    <SelectTrigger className="max-w-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(['active', 'completed', 'archived'] as Task['status'][]).map((s) => (
                                            <SelectItem key={s} value={s}>
                                                <Badge variant={getSubmissionStatusBadgeColor(s)} className="capitalize">{s}</Badge>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Amount & Reward */}
                            <div className="grid grid-cols-2 gap-4 max-w-sm">
                                <div className="space-y-1.5">
                                    <Label>Amount ($)</Label>
                                    <Input
                                        type="number" min={0}
                                        value={form.amount}
                                        onChange={(e) => setForm((p) => ({ ...p, amount: Number(e.target.value) }))}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Reward ($)</Label>
                                    <Input
                                        type="number" min={0}
                                        value={form.reward}
                                        onChange={(e) => setForm((p) => ({ ...p, reward: Number(e.target.value) }))}
                                    />
                                </div>
                            </div>

                            <Separator />

                            {/* Details editor */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label>Details</Label>
                                    <Button
                                        type="button" size="sm" variant="ghost" className="h-7 gap-1 text-xs"
                                        onClick={() => setEditingDetails(!editingDetails)}
                                    >
                                        {editingDetails ? <><X className="h-3 w-3" /> Cancel</> : <><Pencil className="h-3 w-3" /> Edit</>}
                                    </Button>
                                </div>
                                {editingDetails ? (
                                    <MarkdownEditor
                                        value={form.details}
                                        onChange={(md) => setForm((p) => ({ ...p, details: md }))}
                                        minHeight="min-h-48"
                                    />
                                ) : (
                                    <div
                                        className="prose prose-sm max-w-none rounded-lg border bg-muted/20 px-4 py-3 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
                                        onClick={() => setEditingDetails(true)}
                                    >
                                        {form.details
                                            ? <ReactMarkdown>{form.details}</ReactMarkdown>
                                            : <p className="text-muted-foreground italic">Click to add details</p>
                                        }
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Phase editor */}
                            <div className="space-y-2">
                                <Label>Phases</Label>
                                <PhaseBuilder
                                    phases={form.phases}
                                    onChange={(phases) => setForm((p) => ({ ...p, phases }))}
                                />
                            </div>

                            <Separator />

                            {/* Drip feed editor */}
                            <DripFeedConfig
                                value={form.dripFeed}
                                onChange={(drip) => setForm((p) => ({ ...p, dripFeed: drip }))}
                            />

                            <Separator />

                            {/* Save */}
                            <div className="flex gap-3">
                                <Button
                                    onClick={() => handleSave(form)}
                                    disabled={isSaving}
                                    className="gap-2"
                                >
                                    {isSaving
                                        ? <><span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />Saving…</>
                                        : <><Save className="h-4 w-4" />Save Changes</>
                                    }
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        if (task) setForm({
                                            status: task.status,
                                            details: task.details,
                                            amount: task.amount,
                                            reward: task.reward,
                                            phases: task.phases ?? [],
                                            dripFeed: task.dripFeed ?? { enabled: false, dripAmount: 10, dripInterval: 60, totalReleased: 0 },
                                        })
                                    }}
                                >
                                    Reset
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}