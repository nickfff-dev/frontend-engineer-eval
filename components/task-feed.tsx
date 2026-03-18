'use client';
import { useState, useMemo, useId } from 'react'
import { getSubmissions, getTaskTypeLabel, getTaskSlots } from '@/lib/mock-data'
import { getActivePhase, getDripState, advancePhases } from '@/lib/phases'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
    Dialog, DialogContent, DialogDescription,
    DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
    ArrowRight, DollarSign, Users, Clock,
    CheckCircle2, XCircle, Loader2, Droplets,
    ChevronRight, Layers,
} from 'lucide-react'
import { toast } from 'sonner'
import type { TaskType, Submission, User, TaskPhase } from '@/types/types'
import { useTasks, useEditTask } from '@/hooks/use-tasks'
import { useAddSubmission } from '@/hooks/use-submissions'
import type { Task } from '@/types/types'
import { useQueryState, parseAsStringLiteral } from 'nuqs'


type SortOption = 'latest' | 'reward'
type FilterType = 'all' | TaskType

const TASK_TYPE_OPTIONS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Tasks' },
    { value: 'social_media_posting', label: 'Social Media Posting' },
    { value: 'email_sending', label: 'Email Sending' },
    { value: 'social_media_liking', label: 'Social Media Liking' },
]

const EMPTY_FORM = { postUrl: '', emailContent: '', evidenceScreenshot: '' }

// ── Skeletons ─────────────────────────────────────────────────────────────────

function TaskCardSkeleton() {
    return (
        <Card className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex justify-between">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-16" />
            </div>
            <Skeleton className="h-9 w-full" />
        </Card>
    )
}

// ── Phase pill shown on card ──────────────────────────────────────────────────

function PhasePill({ phase, total }: { phase: TaskPhase; total: number }) {
    const pct = phase.slots > 0 ? Math.round((phase.submissionsReceived / phase.slots) * 100) : 0
    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1 text-primary font-medium">
                    <Layers className="h-3 w-3" />
                    Phase {phase.phaseIndex}/{total}
                </span>
                <span className="text-muted-foreground">{phase.submissionsReceived}/{phase.slots}</span>
            </div>
            <Progress value={pct} className="h-1" />
        </div>
    )
}

// ── Drip pill shown on card ───────────────────────────────────────────────────

function DripPill({ task }: { task: Task }) {
    const { state, nextReleaseLabel } = getDripState(task)
    if (!task.dripFeed?.enabled) return null
    return (
        <Badge
            variant={state === 'active' ? 'default' : state === 'waiting' ? 'secondary' : 'outline'}
            className="text-xs gap-1"
        >
            <Droplets className="h-2.5 w-2.5" />
            {state === 'waiting' ? `Next in ${nextReleaseLabel}` : state === 'completed' ? 'Slots full' : 'Drip active'}
        </Badge>
    )
}

// ── Task Card — mobile-first ──────────────────────────────────────────────────

interface TaskCardProps {
    task: Task
    isCompleted: boolean
    onSelect: (task: Task) => void
}

function TaskCard({ task, isCompleted, onSelect }: TaskCardProps) {
    const { maxSlots, slotsRemaining, isFull } = getTaskSlots(task)
    const activePhase = getActivePhase(task)
    const dripState = task.dripFeed?.enabled ? getDripState(task) : null
    const dripBlocked = dripState?.state === 'waiting' || dripState?.state === 'completed'
    const effectiveReward = activePhase ? activePhase.reward : task.reward
    const disabled = (isCompleted && !task.allowMultipleSubmissions) || isFull || dripBlocked

    return (
        <Card
            className={`flex flex-col transition-all duration-200 ${disabled
                    ? 'opacity-60 cursor-not-allowed bg-muted/30'
                    : 'hover:border-primary/40 hover:shadow-md cursor-pointer group'
                }`}
            onClick={() => !disabled && onSelect(task)}
        >
            <CardHeader className="pb-2 p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold leading-snug text-sm ${disabled ? 'text-muted-foreground' : 'text-slate-900 group-hover:text-primary transition-colors'
                        }`}>
                        {task.title}
                    </h3>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        {isCompleted && !task.allowMultipleSubmissions && (
                            <Badge variant="secondary" className="text-xs gap-1">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Done
                            </Badge>
                        )}
                        {isFull && (
                            <Badge variant="destructive" className="text-xs">Full</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                            {getTaskTypeLabel(task.type).split(' ')[0]}
                        </Badge>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
            </CardHeader>

            <CardContent className="flex-1 pb-2 px-4 space-y-2">
                {/* Phase progress */}
                {task.phases?.length && activePhase && (
                    <PhasePill phase={activePhase} total={task.phases.length} />
                )}

                {/* Drip badge */}
                {task.dripFeed?.enabled && <DripPill task={task} />}

                {/* Slots */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-slate-100 pt-2">
                    <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {task.submissionsReceived}/{maxSlots} slots
                    </span>
                    <span className={`font-medium ${isFull ? 'text-destructive' : slotsRemaining <= 3 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                        {isFull ? 'Full' : `${slotsRemaining} left`}
                    </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {task.allowMultipleSubmissions ? 'Multiple allowed' : 'One per person'}
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-0 px-4 pb-4">
                <div className="flex items-center gap-0.5 font-bold">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 text-lg">{effectiveReward}</span>
                    {activePhase && (
                        <span className="text-xs text-muted-foreground font-normal ml-1">this phase</span>
                    )}
                </div>
                <Button
                    size="sm"
                    disabled={disabled}
                    className="h-8 text-xs"
                    onClick={(e) => { e.stopPropagation(); if (!disabled) onSelect(task) }}
                >
                    {disabled
                        ? dripBlocked ? 'Waiting' : isFull ? 'Full' : 'Done'
                        : <><span>Submit</span><ArrowRight className="ml-1 h-3 w-3" /></>
                    }
                </Button>
            </CardFooter>
        </Card>
    )
}

// ── Active phase banner in submit dialog ──────────────────────────────────────

function ActivePhaseBanner({ task }: { task: Task }) {
    const phase = getActivePhase(task)
    if (!task.phases?.length || !phase) return null
    const pct = Math.round((phase.submissionsReceived / phase.slots) * 100)

    return (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-primary">
                        Phase {phase.phaseIndex} of {task.phases.length} — {phase.phaseName}
                    </span>
                </div>
                <span className="text-sm font-bold text-green-700">${phase.reward}</span>
            </div>
            <p className="text-sm text-slate-700">{phase.instructions}</p>
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{phase.submissionsReceived} / {phase.slots} slots filled</span>
                    <span>{pct}%</span>
                </div>
                <Progress value={pct} className="h-1.5" />
            </div>
            {/* Past phases the worker submitted in */}
            {task.phases.filter((p) => p.status === 'completed').length > 0 && (
                <details className="text-xs text-muted-foreground cursor-pointer">
                    <summary className="flex items-center gap-1 hover:text-foreground transition-colors">
                        <ChevronRight className="h-3 w-3" />
                        View completed phases
                    </summary>
                    <div className="mt-2 space-y-1 pl-4 border-l border-border">
                        {task.phases
                            .filter((p) => p.status === 'completed')
                            .map((p) => (
                                <div key={p.id} className="flex items-center gap-2">
                                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                                    <span>Phase {p.phaseIndex} — {p.phaseName} ({p.slots} slots)</span>
                                </div>
                            ))}
                    </div>
                </details>
            )}
        </div>
    )
}

// ── Drip banner in submit dialog ──────────────────────────────────────────────

function DripBanner({ task }: { task: Task }) {
    if (!task.dripFeed?.enabled) return null
    const { state, nextReleaseLabel, slotsAvailable } = getDripState(task)
    const drip = task.dripFeed
    const total = Math.floor(task.amount / task.reward)
    const pct = Math.round((drip.totalReleased / total) * 100)

    return (
        <div className="rounded-lg border bg-sky-50 border-sky-200 p-3 space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium text-sky-800">
                    <Droplets className="h-4 w-4" /> Drip Feed
                </div>
                <Badge
                    variant={state === 'active' ? 'default' : state === 'waiting' ? 'secondary' : 'outline'}
                    className="text-xs capitalize"
                >
                    {state === 'waiting' ? `Next in ${nextReleaseLabel}` : state}
                </Badge>
            </div>
            <Progress value={pct} className="h-1.5" />
            <div className="flex justify-between text-xs text-sky-700">
                <span>{drip.totalReleased} / {total} released</span>
                <span>{slotsAvailable} available now</span>
            </div>
        </div>
    )
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function TaskFeed({ user }: { user: User }) {
    const [sortBy, setSortBy] = useQueryState(
        'sort',
        parseAsStringLiteral(['latest', 'reward'] as const).withDefault('latest')
    )
    const [filterType, setFilterType] = useQueryState(
        'type',
        parseAsStringLiteral(['all', 'social_media_posting', 'email_sending', 'social_media_liking'] as const).withDefault('all')
    )

    const [selectedTask, setSelectedTask] = useState<Task | null>(null)
    const [submissionData, setSubmissionData] = useState(EMPTY_FORM)
    const [submittedRefreshKey, setSubmittedRefreshKey] = useState(0)

    const evidenceInputId = useId()
    const postUrlId = useId()
    const emailContentId = useId()

    const { data, isPending, isError } = useTasks()
    const { mutate: submitTask, isPending: isSubmitting } = useAddSubmission()
    const { mutate: editTask } = useEditTask()

    const submittedTaskIds = useMemo(() => {
        const subs = getSubmissions([{ field: 'workerId', value: user.id }])
        return new Set(subs.map((s) => s.taskId))
    }, [user.id, submittedRefreshKey])

    // Also track which phaseIds the worker has submitted to
    const submittedPhaseIds = useMemo(() => {
        const subs = getSubmissions([{ field: 'workerId', value: user.id }])
        return new Set(subs.map((s) => s.phaseId).filter(Boolean))
    }, [user.id, submittedRefreshKey])

    const filteredTasks = useMemo(() => {
        if (!data) return []
        const active = data.filter(
            (t) => t.status === 'active' && (filterType === 'all' || t.type === filterType)
        )
        return [...active].sort((a, b) =>
            sortBy === 'reward'
                ? b.reward - a.reward
                : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }, [data, sortBy, filterType])

    const handleClose = () => {
        setSelectedTask(null)
        setSubmissionData(EMPTY_FORM)
    }

    const handleSubmit = () => {
        if (!user || !selectedTask) return

        // ── Drip check ────────────────────────────────────────────────────────
        if (selectedTask.dripFeed?.enabled) {
            const { state, slotsAvailable } = getDripState(selectedTask)
            if (state === 'waiting') {
                toast.error('No slots available yet — check back soon')
                return
            }
            if (state === 'completed' || slotsAvailable === 0) {
                toast.error('All slots have been filled')
                return
            }
        }

        // ── Phase check ───────────────────────────────────────────────────────
        const activePhase = getActivePhase(selectedTask)
        if (selectedTask.phases?.length) {
            if (!activePhase) {
                toast.error('All phases are complete')
                return
            }
            if (activePhase.submissionsReceived >= activePhase.slots) {
                toast.error('This phase is full — waiting for next phase to open')
                return
            }
        }

        // ── Slot check ────────────────────────────────────────────────────────
        const { isFull } = getTaskSlots(selectedTask)
        if (isFull) {
            toast.error('This task has no remaining slots')
            return
        }

        // ── Duplicate check ───────────────────────────────────────────────────
        if (!selectedTask.allowMultipleSubmissions) {
            const existing = getSubmissions([
                { field: 'taskId', value: selectedTask.id },
                { field: 'workerId', value: user.id },
            ])
            if (existing.length > 0) {
                toast.error('You have already submitted this task')
                return
            }
        }

        // ── Field validation ──────────────────────────────────────────────────
        if (selectedTask.type === 'social_media_posting' && !submissionData.postUrl) {
            toast.error('Please provide a post URL')
            return
        }
        if (selectedTask.type === 'email_sending' && !submissionData.emailContent) {
            toast.error('Please provide email content')
            return
        }
        if (!submissionData.evidenceScreenshot) {
            toast.error('Please provide an evidence screenshot')
            return
        }

        const newSubmission: Submission = {
            id: crypto.randomUUID(),
            taskId: selectedTask.id,
            workerId: user.id,
            status: 'pending',
            phaseId: activePhase?.id,
            data: {
                postUrl: submissionData.postUrl || undefined,
                emailContent: submissionData.emailContent || undefined,
                evidenceScreenshot: submissionData.evidenceScreenshot,
            },
            submittedAt: new Date(),
        }

        submitTask(newSubmission, {
            onSuccess: () => {
                if (activePhase && selectedTask.phases?.length) {
                    // Increment phase submissions and advance if full
                    const updatedPhases = advancePhases(
                        selectedTask.phases.map((p) =>
                            p.id === activePhase.id
                                ? { ...p, submissionsReceived: p.submissionsReceived + 1 }
                                : p
                        )
                    )
                    editTask({
                        id: selectedTask.id,
                        data: {
                            submissionsReceived: selectedTask.submissionsReceived + 1,
                            phases: updatedPhases,
                        },
                    })
                } else {
                    editTask({
                        id: selectedTask.id,
                        data: { submissionsReceived: selectedTask.submissionsReceived + 1 },
                    })
                }
                setSubmittedRefreshKey((k) => k + 1)
                toast.success('Task submitted! Awaiting review.')
                handleClose()
            },
            onError: () => toast.error('Submission failed. Please try again.'),
        })
    }

    if (isError) return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <XCircle className="h-10 w-10 text-destructive" />
            <p className="font-medium">Failed to load tasks. Please refresh.</p>
        </div>
    )

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Available Tasks</h1>
                <p className="mt-1 text-sm text-slate-500">Browse and complete tasks to earn rewards</p>
            </div>

            {/* Filters — stacked on mobile */}
            <Card>
                <CardContent className="pt-4 pb-4">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label className="text-xs">Filter by Type</Label>
                            <Select value={filterType} onValueChange={(val) => setFilterType(val as FilterType)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {TASK_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-xs">Sort By</Label>
                            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">Newest First</SelectItem>
                                    <SelectItem value="reward">Highest Reward</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    {!isPending && (
                        <p className="mt-3 text-xs text-muted-foreground">
                            Showing <span className="font-medium text-foreground">{filteredTasks.length}</span> of{' '}
                            <span className="font-medium text-foreground">
                                {data?.filter((t) => t.status === 'active').length}
                            </span> active tasks
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Grid — 1 col mobile, 2 col sm, 3 col lg */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {isPending
                    ? Array.from({ length: 6 }).map((_, i) => <TaskCardSkeleton key={i} />)
                    : filteredTasks.length === 0
                        ? (
                            <Card className="col-span-full">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3">
                                    <CheckCircle2 className="h-10 w-10" />
                                    <p className="font-medium text-sm">No tasks match your filters</p>
                                </CardContent>
                            </Card>
                        )
                        : filteredTasks.map((task) => (
                            <TaskCard
                                key={task.id}
                                task={task}
                                isCompleted={submittedTaskIds.has(task.id)}
                                onSelect={setSelectedTask}
                            />
                        ))}
            </div>

            {/* Submit Dialog — full screen on mobile */}
            <Dialog open={!!selectedTask} onOpenChange={(open) => !open && handleClose()}>
                {selectedTask && (
                    <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="text-lg leading-snug">{selectedTask.title}</DialogTitle>
                            <DialogDescription>{selectedTask.description}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-5">
                            {/* Active phase banner */}
                            <ActivePhaseBanner task={selectedTask} />

                            {/* Drip banner */}
                            <DripBanner task={selectedTask} />

                            {/* Info grid */}
                            <div className="grid grid-cols-3 gap-3 bg-muted/40 rounded-lg p-3">
                                <div>
                                    <p className="text-xs text-muted-foreground">Type</p>
                                    <p className="text-xs font-semibold mt-0.5">{getTaskTypeLabel(selectedTask.type)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Reward</p>
                                    <p className="text-sm font-bold text-green-700 mt-0.5">
                                        ${getActivePhase(selectedTask)?.reward ?? selectedTask.reward}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">Submissions</p>
                                    <p className="text-sm font-semibold mt-0.5">{selectedTask.submissionsReceived}</p>
                                </div>
                            </div>

                            {/* Details — rendered as markdown */}
                            {selectedTask.details && (
                                <div>
                                    <p className="text-sm font-medium mb-2">Task Details</p>
                                    <div className="prose prose-sm max-w-none text-slate-600 rounded-lg bg-muted/20 px-4 py-3">
                                        {selectedTask.details}
                                    </div>
                                </div>
                            )}

                            {/* Active phase instructions (if different from main details) */}
                            {(() => {
                                const phase = getActivePhase(selectedTask)
                                if (!phase || phase.instructions === selectedTask.details) return null
                                return (
                                    <div>
                                        <p className="text-sm font-medium mb-1">Phase Instructions</p>
                                        <p className="text-sm text-slate-600 bg-muted/20 rounded-lg px-4 py-3">
                                            {phase.instructions}
                                        </p>
                                    </div>
                                )
                            })()}

                            {/* Submission form */}
                            <div className="space-y-4 border-t pt-4">
                                <p className="text-sm font-medium">Your Submission</p>

                                {selectedTask.type === 'social_media_posting' && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor={postUrlId}>Post URL *</Label>
                                        <Input
                                            id={postUrlId}
                                            placeholder="https://example.com/post"
                                            value={submissionData.postUrl}
                                            onChange={(e) => setSubmissionData((p) => ({ ...p, postUrl: e.target.value }))}
                                        />
                                    </div>
                                )}

                                {selectedTask.type === 'email_sending' && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor={emailContentId}>Email Content *</Label>
                                        <Textarea
                                            id={emailContentId}
                                            placeholder="Paste your email content..."
                                            value={submissionData.emailContent}
                                            onChange={(e) => setSubmissionData((p) => ({ ...p, emailContent: e.target.value }))}
                                            className="min-h-24 resize-none"
                                        />
                                    </div>
                                )}

                                <div className="space-y-1.5">
                                    <Label htmlFor={evidenceInputId}>Evidence Screenshot *</Label>
                                    <Input
                                        id={evidenceInputId}
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0]
                                            if (file) {
                                                const reader = new FileReader()
                                                reader.onloadend = () =>
                                                    setSubmissionData((p) => ({ ...p, evidenceScreenshot: reader.result as string }))
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                    />
                                    {submissionData.evidenceScreenshot && (
                                        <img
                                            src={submissionData.evidenceScreenshot}
                                            alt="Evidence preview"
                                            className="mt-2 h-28 w-28 object-cover rounded-md border"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="flex-col-reverse sm:flex-row gap-2 pt-4">
                            <Button variant="outline" onClick={handleClose} disabled={isSubmitting} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto min-w-28"
                            >
                                {isSubmitting
                                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting…</>
                                    : 'Submit Task'
                                }
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    )
}