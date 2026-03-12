'use client';
import { Card } from '@/components/ui/card'
import { Users, FileText, CheckCircle2, Clock } from 'lucide-react'
import { useTasks } from '@/hooks/use-tasks';
import { useSubmissions } from '@/hooks/use-submissions';
import { Skeleton } from '@/components/ui/skeleton'

function MetricCardSkeleton() {
    return (
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-16" />
          </div>
          <Skeleton className="h-12 w-12 rounded-lg" />
        </div>
        <Skeleton className="mt-4 h-3 w-36" />
      </Card>
    )
  }

  export const MetricsGrid = () => {
    const { data: tasks, isPending: tasksPending } = useTasks();
    const { data: submissions, isPending: submissionsPending } = useSubmissions();
  
    const isPending = tasksPending || submissionsPending;
  
    const activeTasks = tasks?.filter((t) => t.status === 'active')?.length || 0
    const totalSubmissions = submissions?.length || 0
    const approvedSubmissions = submissions?.filter((s) => s.status === 'approved').length || 0
    const pendingSubmissions = submissions?.filter((s) => s.status === 'pending').length || 0
  
    const metrics = [
      {
        label: 'Active Tasks',
        value: activeTasks,
        description: 'Tasks available for completion',
        icon: <FileText className="h-6 w-6 text-blue-600" />,
        iconBg: 'bg-blue-50',
      },
      {
        label: 'Submissions',
        value: totalSubmissions,
        description: 'Total submissions received',
        icon: <Users className="h-6 w-6 text-amber-600" />,
        iconBg: 'bg-amber-50',
      },
      {
        label: 'Approved',
        value: approvedSubmissions,
        description: 'Approved submissions',
        icon: <CheckCircle2 className="h-6 w-6 text-emerald-600" />,
        iconBg: 'bg-emerald-50',
      },
      {
        label: 'Pending',
        value: pendingSubmissions,
        description: 'Awaiting review',
        icon: <Clock className="h-6 w-6 text-sky-600" />,
        iconBg: 'bg-sky-50',
      },
    ]
  
    if (isPending) {
      return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)}
        </div>
      )
    }
  
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.label} className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">{metric.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{metric.value}</p>
              </div>
              <div className={`rounded-lg ${metric.iconBg} p-3`}>{metric.icon}</div>
            </div>
            <p className="mt-4 text-xs text-slate-500">{metric.description}</p>
          </Card>
        ))}
      </div>
    )
  }