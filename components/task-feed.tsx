'use client';
import { useState, useMemo, useId } from 'react'
import { getSubmissions, getTaskTypeLabel } from '@/lib/mock-data'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getTaskSlots } from '@/lib/mock-data'

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Skeleton } from '@/components/ui/skeleton'
import {
    ArrowRight,
    DollarSign,
    Users,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import type { TaskType, Submission, User } from '@/types/types'
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

// ── Sub-components ────────────────────────────────────────────────────────────

function TaskCardSkeleton() {
    return (
        <Card className="p-6 space-y-3">
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

interface TaskCardProps {
    task: Task
    onSelect: (task: Task) => void
}

function TaskCard({ task, onSelect }: TaskCardProps) {
    const { maxSlots, slotsRemaining, isFull } = getTaskSlots(task)
    return (
        <Card
            className="flex flex-col hover:border-blue-300 hover:shadow-lg transition-all duration-200 cursor-pointer group"
            onClick={() => onSelect(task)}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors">
                        {task.title}
                    </h3>
                    <Badge variant="outline" className="shrink-0 text-xs">
                        {getTaskTypeLabel(task.type).split(' ')[0]}
                    </Badge>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2">{task.description}</p>
            </CardHeader>

            <CardContent className="flex-1 pb-3">
                <div className="flex items-center justify-between text-sm text-slate-500 border-t border-slate-100 pt-3">
                    <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {task.submissionsReceived} / {maxSlots} slots
                    </span>
                    {/* Slots remaining indicator */}
                    <span className={`text-xs font-medium ${isFull
                        ? 'text-destructive'
                        : slotsRemaining <= 3
                            ? 'text-amber-600'
                            : 'text-emerald-600'
                        }`}>
                        {isFull ? 'Full' : `${slotsRemaining} left`}
                    </span>
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-0">
                <div className="flex items-center gap-1 text-xl font-bold">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    <span className="text-green-700">{task.reward}</span>
                </div>
                <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700"
                    disabled={isFull}
                    onClick={(e) => { e.stopPropagation(); if (!isFull) onSelect(task) }}
                >
                    {isFull ? 'Done' : 'Submit'}
                    {!isFull && <ArrowRight className="ml-1 h-4 w-4" />}
                </Button>
            </CardFooter>
        </Card>
    )
}

// ── Main Component ─────────────────────────────────────────────────────────────────

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
    const evidenceInputId = useId()
    const postUrlId = useId()
    const emailContentId = useId()

    const { data, isPending, isError } = useTasks()
    const submittedTaskIds = useMemo(() => {
        const userSubmissions = getSubmissions([{ field: 'workerId', value: user.id }])
        return new Set(userSubmissions.map((s) => s.taskId))
    }, [user.id])
    const { mutate: submitTask, isPending: isSubmitting, isSuccess, isError: isSubmitError } = useAddSubmission()
    const { mutate: editTask } = useEditTask();
    // ── All filtering & sorting via useMemo — no useEffect needed ──────────────
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
        if (!user) return
        if (!selectedTask) return
        // ✅ Check slots before anything else
        const { isFull, slotsRemaining } = getTaskSlots(selectedTask)
        if (isFull) {
            toast.error('This task has no remaining slots')
            return
        }
        if (!selectedTask.allowMultipleSubmissions) {
            const existingSubmission = getSubmissions([
                { field: 'taskId', value: selectedTask.id },
                { field: 'workerId', value: user.id },
            ])
            if (existingSubmission.length > 0) {
                toast.error('You have already submitted this task')
                return
            }
        }
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
            data: {
                postUrl: submissionData.postUrl || undefined,
                emailContent: submissionData.emailContent || undefined,
                evidenceScreenshot: submissionData.evidenceScreenshot,
            },
            submittedAt: new Date(),
        }
        submitTask(newSubmission, {
            onSuccess: () => {
                editTask({
                    id: selectedTask.id,
                    data: { submissionsReceived: selectedTask.submissionsReceived + 1 },
                });
                toast.success('Task submitted! Awaiting review.')
                handleClose()
            },
            onError: () => {
                toast.error('Submission failed. Please try again.')
            },
        })
    }

    // ── Render ─────────────────────────────────────────────────────────────────

    if (isError) return (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-500">
            <XCircle className="h-10 w-10 text-destructive" />
            <p className="font-medium">Failed to load tasks. Please refresh.</p>
        </div>
    )

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Available Tasks</h1>
                <p className="mt-1 text-slate-500">Browse and complete tasks to earn rewards</p>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label>Filter by Type</Label>
                            <Select value={filterType} onValueChange={(val) => setFilterType(val as FilterType)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TASK_TYPE_OPTIONS.map((opt) => (
                                        <SelectItem key={opt.value} value={opt.value}>
                                            {opt.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Sort By</Label>
                            <Select value={sortBy} onValueChange={(val) => setSortBy(val as SortOption)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="latest">Newest First</SelectItem>
                                    <SelectItem value="reward">Highest Reward</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {!isPending && (
                        <p className="mt-4 text-sm text-slate-500">
                            Showing <span className="font-medium text-slate-700">{filteredTasks.length}</span> of{' '}
                            <span className="font-medium text-slate-700">
                                {data?.filter((t) => t.status === 'active').length}
                            </span>{' '}
                            active tasks
                        </p>
                    )}
                </CardContent>
            </Card>

            {/* Grid */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isPending
                    ? Array.from({ length: 6 }).map((_, i) => <TaskCardSkeleton key={i} />)
                    : filteredTasks.length === 0
                        ? (
                            <Card className="col-span-full">
                                <CardContent className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
                                    <CheckCircle2 className="h-10 w-10" />
                                    <p className="font-medium">No tasks match your filters</p>
                                </CardContent>
                            </Card>
                        )
                        : filteredTasks.map((task) => (
                            <TaskCard key={task.id} task={task} onSelect={setSelectedTask} />
                        ))}
            </div>

            {/* Submit Dialog */}
            <Dialog open={!!selectedTask} onOpenChange={(open) => !open && handleClose()}>
                {selectedTask && (
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>{selectedTask.title}</DialogTitle>
                            <DialogDescription>{selectedTask.description}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6">
                            {/* Info grid */}
                            <div className="grid grid-cols-3 gap-4 bg-slate-50 rounded-lg p-4">
                                <div>
                                    <p className="text-xs text-slate-500">Type</p>
                                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                                        {getTaskTypeLabel(selectedTask.type)}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Reward</p>
                                    <p className="text-sm font-semibold text-green-700 mt-0.5">
                                        ${selectedTask.reward}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">Submissions</p>
                                    <p className="text-sm font-semibold text-slate-900 mt-0.5">
                                        {selectedTask.submissionsReceived}
                                    </p>
                                </div>
                            </div>

                            {/* Details */}
                            <div>
                                <p className="text-sm font-medium text-slate-900 mb-1">Task Details</p>
                                <div className="prose prose-sm max-w-none text-sm text-slate-600">
                                    {selectedTask.details}
                                </div>
                            </div>

                            {/* Submission form */}
                            <div className="space-y-4 border-t pt-5">
                                <p className="text-sm font-medium text-slate-900">Your Submission</p>

                                {selectedTask.type === 'social_media_posting' && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor={postUrlId}>Post URL *</Label>
                                        <Input
                                            id={postUrlId}
                                            placeholder="https://example.com/post"
                                            value={submissionData.postUrl}
                                            onChange={(e) =>
                                                setSubmissionData((prev) => ({ ...prev, postUrl: e.target.value }))
                                            }
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
                                            onChange={(e) =>
                                                setSubmissionData((prev) => ({ ...prev, emailContent: e.target.value }))
                                            }
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
                                                reader.onloadend = () => {
                                                    setSubmissionData((prev) => ({
                                                        ...prev,
                                                        evidenceScreenshot: reader.result as string,
                                                    }))
                                                }
                                                reader.readAsDataURL(file)
                                            }
                                        }}
                                    />
                                    {submissionData.evidenceScreenshot && (
                                        <img
                                            src={submissionData.evidenceScreenshot}
                                            alt="Evidence preview"
                                            className="mt-2 h-32 w-32 object-cover rounded-md border"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button
                                className="bg-blue-600 hover:bg-blue-700 min-w-30"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting…
                                    </>
                                ) : (
                                    'Submit Task'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                )}
            </Dialog>
        </div>
    )
}