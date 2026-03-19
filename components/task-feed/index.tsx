'use client';
import { useState, useMemo, useId } from 'react'
import { getSubmissions, getTaskTypeLabel, getTaskSlots } from '@/lib/mock-data'
import { getActivePhase, getDripState, advancePhases } from '@/lib/phases'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
import { CheckCircle2, XCircle, Loader2, Droplets, Layers } from 'lucide-react'
import { toast } from 'sonner'
import type { TaskType, Submission, User } from '@/types/types'
import { useTasks, useEditTask } from '@/hooks/use-tasks'
import { useAddSubmission } from '@/hooks/use-submissions'
import type { Task } from '@/types/types'
import { useQueryState, parseAsStringLiteral } from 'nuqs'
import { ActivePhaseBanner, DripBanner } from '../phases/pill-assest';
import { TaskCardSkeleton } from './skeleton';
import { TaskCard } from './task-card';
import { Badge } from '../ui/badge';
import ReactMarkdown from 'react-markdown'

type SortOption = 'latest' | 'reward'
type FilterType = 'all' | TaskType
const TASK_TYPE_OPTIONS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All Tasks' },
    { value: 'social_media_posting', label: 'Social Media Posting' },
    { value: 'email_sending', label: 'Email Sending' },
    { value: 'social_media_liking', label: 'Social Media Liking' },
]
const EMPTY_FORM = { postUrl: '', emailContent: '', evidenceScreenshot: '' }

export default function TaskFeed({ user }: { user: User }) {
    const [sortBy, setSortBy] = useQueryState(
        'sort',
        parseAsStringLiteral(['latest', 'reward'] as const).withDefault('latest')
    )
    const [filterType, setFilterType] = useQueryState(
        'type',
        parseAsStringLiteral(['all', 'social_media_posting', 'email_sending', 'social_media_liking'] as const).withDefault('all')
    )
    const [showPhased, setShowPhased] = useQueryState(
        'phased',
        parseAsStringLiteral(['all', 'phased', 'standard'] as const).withDefault('all')
    )
    const [showDrip, setShowDrip] = useQueryState(
        'drip',
        parseAsStringLiteral(['all', 'drip', 'standard'] as const).withDefault('all')
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
        const active = data.filter((t) => {
            if (t.status !== 'active') return false
            if (filterType !== 'all' && t.type !== filterType) return false
            if (showPhased === 'phased' && !t.phases?.length) return false
            if (showPhased === 'standard' && t.phases?.length) return false
            if (showDrip === 'drip' && !t.dripFeed?.enabled) return false
            if (showDrip === 'standard' && t.dripFeed?.enabled) return false
            return true
        })
        return [...active].sort((a, b) =>
            sortBy === 'reward'
                ? b.reward - a.reward
                : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    }, [data, sortBy, filterType, showPhased, showDrip])

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
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Existing type filter */}
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

                        {/* Existing sort */}
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

                        {/* ✅ Phase filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs flex items-center gap-1">
                                <Layers className="h-3 w-3" /> Phases
                            </Label>
                            <Select value={showPhased} onValueChange={(val) => setShowPhased(val as any)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tasks</SelectItem>
                                    <SelectItem value="phased">Phased Only</SelectItem>
                                    <SelectItem value="standard">Standard Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* ✅ Drip filter */}
                        <div className="space-y-1.5">
                            <Label className="text-xs flex items-center gap-1">
                                <Droplets className="h-3 w-3" /> Drip Feed
                            </Label>
                            <Select value={showDrip} onValueChange={(val) => setShowDrip(val as any)}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Tasks</SelectItem>
                                    <SelectItem value="drip">Drip Only</SelectItem>
                                    <SelectItem value="standard">No Drip</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Active filter badges + clear all */}
                    {(filterType !== 'all' || showPhased !== 'all' || showDrip !== 'all') && (
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            <span className="text-xs text-muted-foreground">Active filters:</span>
                            {filterType !== 'all' && (
                                <Badge variant="secondary" className="text-xs gap-1 cursor-pointer"
                                    onClick={() => setFilterType('all')}>
                                    {TASK_TYPE_OPTIONS.find(o => o.value === filterType)?.label} ×
                                </Badge>
                            )}
                            {showPhased !== 'all' && (
                                <Badge variant="secondary" className="text-xs gap-1 cursor-pointer"
                                    onClick={() => setShowPhased('all')}>
                                    {showPhased === 'phased' ? 'Phased only' : 'Standard only'} ×
                                </Badge>
                            )}
                            {showDrip !== 'all' && (
                                <Badge variant="secondary" className="text-xs gap-1 cursor-pointer"
                                    onClick={() => setShowDrip('all')}>
                                    {showDrip === 'drip' ? 'Drip only' : 'No drip'} ×
                                </Badge>
                            )}
                            <button
                                className="text-xs text-muted-foreground hover:text-foreground underline ml-1 cursor-pointer"
                                onClick={() => { setFilterType('all'); setShowPhased('all'); setShowDrip('all') }}
                            >
                                Clear all
                            </button>
                        </div>
                    )}

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
                                    <ReactMarkdown children={selectedTask.details || "No details provided."} />
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