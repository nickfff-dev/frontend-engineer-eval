'use client';
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link';
import { useTasks } from '@/hooks/use-tasks';
import { Skeleton } from '@/components/ui/skeleton';


function RecentTaskSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 p-4">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-3 w-10" />
        </div>
      </div>
      <Skeleton className="ml-4 h-5 w-12" />
    </div>
  )
}
export const RecentTasks = ({ isAdmin }: { isAdmin: boolean }) => {
  const { data: tasks, isPending } = useTasks();
  const recentTasks = tasks?.slice(0, 5) || [];

  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Recent Tasks</h2>
        <Link href={isAdmin ? '/tasks/management' : '/feed'}>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="space-y-3">
        {isPending
          ? Array.from({ length: 5 }).map((_, i) => <RecentTaskSkeleton key={i} />)
          : recentTasks.length === 0
            ? <p className="py-8 text-center text-sm text-muted-foreground">No tasks yet.</p>
            : recentTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-lg border border-slate-200 p-4 hover:bg-slate-50"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900">{task.title}</p>
                  <div className="mt-1 flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs capitalize">
                      {task.type.replace(/_/g, ' ')}
                    </Badge>
                    <span className="text-xs text-slate-500">${task.reward}</span>
                  </div>
                </div>
                <span className="ml-4 text-sm font-semibold text-slate-900">${task.amount}</span>
              </div>
            ))}
      </div>
    </Card>
  )
}