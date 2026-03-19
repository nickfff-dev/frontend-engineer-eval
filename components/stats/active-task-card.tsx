'use client'
import {
Layers,
  Droplets
} from 'lucide-react'
import { getActivePhase, getDripState } from '@/lib/phases'
import type { Task } from '@/types/types'


export function ActiveTaskCard({ task, userSubmissionCount }: { task: Task; userSubmissionCount: number }) {
  const activePhase = getActivePhase(task)
  const dripInfo = task.dripFeed?.enabled ? getDripState(task) : null
  const reward = activePhase?.reward ?? task.reward
  const phaseName = activePhase
    ? `Phase ${activePhase.phaseIndex} — ${activePhase.phaseName}`
    : null

  return (
    <div className="rounded-lg border p-3 space-y-2 bg-muted/20">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{task.title}</p>
          {phaseName && (
            <p className="text-xs text-primary flex items-center gap-1 mt-0.5">
              <Layers className="h-3 w-3" /> {phaseName}
            </p>
          )}
        </div>
        <span className="text-sm font-bold text-green-700 shrink-0">${reward}</span>
      </div>

      {dripInfo && (
        <div className="flex items-center gap-1 text-xs text-sky-600">
          <Droplets className="h-3 w-3" />
          {dripInfo.state === 'waiting'
            ? `Next release in ${dripInfo.nextReleaseLabel}`
            : dripInfo.state === 'completed'
              ? 'All slots released'
              : `${dripInfo.slotsAvailable} slots available`
          }
        </div>
      )}

      {userSubmissionCount > 0 && (
        <p className="text-xs text-muted-foreground">
          You have {userSubmissionCount} submission{userSubmissionCount > 1 ? 's' : ''} on this task
        </p>
      )}
    </div>
  )
}
