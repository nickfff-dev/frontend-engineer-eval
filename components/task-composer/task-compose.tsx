'use client'
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAddTask } from '@/hooks/use-tasks'
import type { Task, TaskPhase, DripFeed } from '@/types/types'
import { MarkdownEditor } from '@/components/markdown-editor'
import { PhaseBuilder } from '@/components/task-composer/phase-builder'
import { DripFeedConfig } from '@/components/task-composer/drip-feed-config'
import { BulkUpload } from '@/components/task-composer/bulk-upload'

const taskSchema = z.object({
  type: z.enum(['social_media_posting', 'email_sending', 'social_media_liking']),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  details: z.string().min(10, 'Details must be at least 10 characters'),
  amount: z.number().min(1, 'Amount must be at least 1'),
  reward: z.number().min(1, 'Reward must be at least 1'),
  allowMultipleSubmissions: z.boolean(),
  campaignId: z.string().optional(),
})

type TaskFormData = z.infer<typeof taskSchema>

const DEFAULT_DRIP: DripFeed = {
  enabled: false,
  dripAmount: 10,
  dripInterval: 60,
  totalReleased: 0,
}

export default function TaskComposer() {
  const { mutate: addTask, isPending } = useAddTask()

  // Phase 2 state — lives outside RHF since it's complex nested data
  const [phases, setPhases] = useState<TaskPhase[]>([])
  const [dripFeed, setDripFeed] = useState<DripFeed>(DEFAULT_DRIP)
  const [bulkTasks, setBulkTasks] = useState<Partial<Task>[]>([])
  const [isBulkCreating, setIsBulkCreating] = useState(false)

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      type: 'social_media_posting',
      allowMultipleSubmissions: false,
    },
  })

  const onSubmit = (data: TaskFormData) => {
    const newTask: Task = {
      ...data,
      id: crypto.randomUUID(),
      status: 'active',
      createdAt: new Date(),
      submissionsReceived: 0,
      phases: phases.length > 0 ? phases : undefined,
      dripFeed: dripFeed.enabled ? { ...dripFeed, lastReleasedAt: new Date() } : undefined,
    }

    addTask(newTask, {
      onSuccess: () => {
        toast.success('Task created successfully!')
        reset()
        setPhases([])
        setDripFeed(DEFAULT_DRIP)
      },
      onError: () => toast.error('Failed to create task'),
    })
  }

  const handleBulkCreate = async () => {
    if (!bulkTasks.length) return
    setIsBulkCreating(true)
    let success = 0
    for (const partial of bulkTasks) {
      await new Promise<void>((resolve) => {
        addTask(
          {
            ...partial,
            id: crypto.randomUUID(),
            status: 'active',
            createdAt: new Date(),
            submissionsReceived: 0,
          } as Task,
          {
            onSuccess: () => { success++; resolve() },
            onError: () => resolve(),
          }
        )
      })
    }
    toast.success(`Created ${success} of ${bulkTasks.length} tasks`)
    setBulkTasks([])
    setIsBulkCreating(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Task</h1>
        <p className="mt-2 text-slate-600">Add a new task for workers to complete</p>
      </div>

      <Tabs defaultValue="single">
        <TabsList className="w-full">
          <TabsTrigger value="single" className="flex-1">Single Task</TabsTrigger>
          <TabsTrigger value="bulk" className="flex-1">Bulk Upload</TabsTrigger>
        </TabsList>

        {/* ── Single Task ─────────────────────────────────────────────────── */}
        <TabsContent value="single">
          <Card className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Task Type */}
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium">Task Type *</Label>
                <Controller
                  name="type"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social_media_posting">Social Media Posting</SelectItem>
                        <SelectItem value="email_sending">Email Sending</SelectItem>
                        <SelectItem value="social_media_liking">Social Media Liking</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.type && <p className="text-xs text-red-600">{errors.type.message}</p>}
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium">Task Title *</Label>
                <Input placeholder="e.g., Share our latest blog post" {...register('title')} />
                {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium">Description</Label>
                <Input placeholder="Brief description of the task" {...register('description')} />
                {errors.description && <p className="text-xs text-red-600">{errors.description.message}</p>}
              </div>

              {/* Details */}
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium">Task Details *</Label>
                <Controller
                  name="details"
                  control={control}
                  render={({ field }) => (
                    <MarkdownEditor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Detailed instructions for the task"
                    />
                  )}
                />
                {errors.details && <p className="text-xs text-red-600">{errors.details.message}</p>}
              </div>

              {/* Amount & Reward */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium">Total Amount ($) *</Label>
                  <Input type="number" placeholder="100" {...register('amount', { valueAsNumber: true })} />
                  {errors.amount && <p className="text-xs text-red-600">{errors.amount.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-900 font-medium">Reward per Submission ($) *</Label>
                  <Input type="number" placeholder="10" {...register('reward', { valueAsNumber: true })} />
                  {errors.reward && <p className="text-xs text-red-600">{errors.reward.message}</p>}
                </div>
              </div>

              {/* Campaign ID */}
              <div className="space-y-2">
                <Label className="text-slate-900 font-medium">Campaign ID</Label>
                <Input placeholder="e.g., camp-001" {...register('campaignId')} />
              </div>

              {/* Allow Multiple Submissions */}
              <div className="flex items-center space-x-3 rounded-lg bg-slate-50 p-4">
                <Controller
                  name="allowMultipleSubmissions"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      id="allowMultiple"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  )}
                />
                <div className="flex-1">
                  <Label htmlFor="allowMultiple" className="font-medium text-slate-900 cursor-pointer">
                    Allow Multiple Submissions
                  </Label>
                  <p className="mt-1 text-sm text-slate-600">
                    Workers can submit multiple times for this task
                  </p>
                </div>
              </div>

              <Separator />

              {/* ── Phases ───────────────────────────────────────────────── */}
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-slate-900">Task Phases</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Break the task into sequential stages. Leave empty for standard behavior.
                  </p>
                </div>
                <PhaseBuilder phases={phases} onChange={setPhases} />
              </div>

              <Separator />

              {/* ── Drip Feed ────────────────────────────────────────────── */}
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-slate-900">Drip Feed</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Release slots in controlled batches instead of all at once.
                  </p>
                </div>
                <DripFeedConfig value={dripFeed} onChange={setDripFeed} />
              </div>

              <Separator />

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button type="submit" disabled={isPending} className="flex-1">
                  {isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating…</> : 'Create Task'}
                </Button>
                <Button
                  type="button" variant="outline" className="flex-1"
                  onClick={() => { reset(); setPhases([]); setDripFeed(DEFAULT_DRIP) }}
                  disabled={isPending}
                >
                  Clear
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        {/* ── Bulk Upload ─────────────────────────────────────────────────── */}
        <TabsContent value="bulk">
          <Card className="p-8 space-y-4">
            <div>
              <p className="font-medium text-slate-900">Bulk Task Upload</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload a CSV to create multiple tasks at once.
              </p>
            </div>
            <BulkUpload onTasksParsed={setBulkTasks} />
            {bulkTasks.length > 0 && (
              <Button
                className="w-full"
                onClick={handleBulkCreate}
                disabled={isBulkCreating}
              >
                {isBulkCreating
                  ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating {bulkTasks.length} tasks…</>
                  : `Create ${bulkTasks.length} Task${bulkTasks.length > 1 ? 's' : ''}`
                }
              </Button>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-900">
          Tasks created here will appear in the Task Management dashboard and be available for
          workers to complete.
        </AlertDescription>
      </Alert>
    </div>
  )
}