'use client'

import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAddTask } from '@/hooks/use-tasks'
import type { Task } from '@/types/types'

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

export default function TaskComposer() {
  const { mutate: addTask, isPending } = useAddTask()

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
    }

    addTask(newTask, {
      onSuccess: () => {
        toast.success('Task created successfully!')
        reset()
      },
      onError: () => {
        toast.error('Failed to create task')
      },
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Create New Task</h1>
        <p className="mt-2 text-slate-600">Add a new task for workers to complete</p>
      </div>

      {/* Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Task Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="text-slate-900 font-medium">
              Task Type *
            </Label>
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="border-slate-300">
                    <SelectValue />
                  </SelectTrigger>
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
            <Label htmlFor="title" className="text-slate-900 font-medium">
              Task Title *
            </Label>
            <Input
              id="title"
              placeholder="e.g., Share our latest blog post"
              {...register('title')}
              className="border-slate-300"
            />
            {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-900 font-medium">
              Description
            </Label>
            <Input
              id="description"
              placeholder="Brief description of the task"
              {...register('description')}
              className="border-slate-300"
            />
            {errors.description && (
              <p className="text-xs text-red-600">{errors.description.message}</p>
            )}
          </div>

          {/* Details */}
          <div className="space-y-2">
            <Label htmlFor="details" className="text-slate-900 font-medium">
              Task Details *
            </Label>
            <Textarea
              id="details"
              placeholder="Detailed instructions for the task"
              {...register('details')}
              className="min-h-32 border-slate-300 resize-none"
            />
            {errors.details && <p className="text-xs text-red-600">{errors.details.message}</p>}
          </div>

          {/* Amount & Reward */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-slate-900 font-medium">
                Total Amount ($) *
              </Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                {...register('amount', { valueAsNumber: true })}
                className="border-slate-300"
              />
              {errors.amount && <p className="text-xs text-red-600">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="reward" className="text-slate-900 font-medium">
                Reward per Submission ($) *
              </Label>
              <Input
                id="reward"
                type="number"
                placeholder="50"
                {...register('reward', { valueAsNumber: true })}
                className="border-slate-300"
              />
              {errors.reward && <p className="text-xs text-red-600">{errors.reward.message}</p>}
            </div>
          </div>

          {/* Campaign ID */}
          <div className="space-y-2">
            <Label htmlFor="campaignId" className="text-slate-900 font-medium">
              Campaign ID
            </Label>
            <Input
              id="campaignId"
              placeholder="e.g., camp-001"
              {...register('campaignId')}
              className="border-slate-300"
            />
            {errors.campaignId && (
              <p className="text-xs text-red-600">{errors.campaignId.message}</p>
            )}
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
                  className="border-slate-300"
                />
              )}
            />
            <div className="flex-1">
              <Label htmlFor="allowMultiple" className="font-medium text-slate-900 cursor-pointer">
                Allow Multiple Submissions
              </Label>
              <p className="mt-1 text-sm text-slate-600">
                Check if workers can submit multiple times for this task
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isPending}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Task…
                </>
              ) : (
                'Create Task'
              )}
            </Button>
            <Button type="button" variant="outline" onClick={() => reset()} disabled={isPending} className="flex-1">
              Clear
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Card */}
      <Alert className="border-blue-200 bg-blue-50">
        <AlertDescription className="text-blue-900">
          Tasks created here will appear in the Task Management dashboard and be available for
          workers to complete.
        </AlertDescription>
      </Alert>
    </div>
  )
}