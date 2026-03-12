'use client';
import { useAuth } from '@/context/AuthContext'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link';
import { RecentTasks } from '@/components/recent-tasks';
import { MetricsGrid } from '@/components/metrics-grid';
import { Unauthenticated } from '@/components/unauthenticated';
import Loading from '@/components/loader';
import WorkerMetrics from '@/components/worker-metrics';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  if (isLoading) return <Loading />
  if (!user) return <Unauthenticated />
  const isAdmin = user.role === 'admin';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Welcome back, {user.name}!</h1>
        <p className="mt-2 text-slate-600">
          {isAdmin ? 'Manage tasks and review submissions' : 'Complete tasks and earn rewards'}
        </p>
      </div>
      {
        !isAdmin && <WorkerMetrics user={user} />
      }
      {/* Metrics Grid */}
      {
        isAdmin && <MetricsGrid />
      }
      {/* Quick Actions */}

      {isAdmin && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Quick Actions</h3>
            <div className="mt-4 flex flex-col gap-y-2">
              <Link href="/tasks/composer">
                <Button variant="outline" className="w-full justify-between">
                  <span>Create New Task</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/submissions">
                <Button variant="outline" className="w-full justify-between">
                  <span>Review Submissions</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/users">
                <Button variant="outline" className="w-full justify-between">
                  <span>Manage Users</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">System Status</h3>
            <div className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Database</span>
                <Badge className="bg-emerald-100 text-emerald-700">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">API</span>
                <Badge className="bg-emerald-100 text-emerald-700">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Workers</span>
                <Badge className="bg-emerald-100 text-emerald-700">Online</Badge>
              </div>
            </div>
          </Card>
        </div>
      )}
      {/* Recent Tasks */}
      <RecentTasks isAdmin={isAdmin} />
    </div>
  )
}



