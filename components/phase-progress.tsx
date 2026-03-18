'use client'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Circle, Clock } from 'lucide-react'
import type { TaskPhase } from '@/types/types'
import { getPhaseProgress } from '@/lib/phases'
import { cn } from '@/lib/utils'

interface PhaseProgressProps {
  phases: TaskPhase[]
  compact?: boolean   // compact=true for table cell, false for full view
}

export function PhaseProgress({ phases, compact = false }: PhaseProgressProps) {
  if (compact) {
    const active = phases.find((p) => p.status === 'active')
    const completed = phases.filter((p) => p.status === 'completed').length
    return (
      <div className="space-y-1 min-w-32">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Phase {(active?.phaseIndex ?? completed)}/{phases.length}</span>
          <span className="font-medium">{completed === phases.length ? '✓ Done' : `${active?.submissionsReceived}/${active?.slots}`}</span>
        </div>
        {active && (
          <Progress value={getPhaseProgress(active).percent} className="h-1.5" />
        )}
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {phases.map((phase, i) => {
        const { percent, filled, remaining, isFull } = getPhaseProgress(phase)
        return (
          <div key={phase.id} className="space-y-1.5">
            <div className="flex items-center gap-2">
              {phase.status === 'completed'
                ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                : phase.status === 'active'
                  ? <Circle className="h-4 w-4 text-primary shrink-0" />
                  : <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
              }
              <span className={cn(
                'text-sm font-medium',
                phase.status === 'pending' && 'text-muted-foreground'
              )}>
                Phase {phase.phaseIndex} — {phase.phaseName}
              </span>
              <Badge
                variant={
                  phase.status === 'completed' ? 'default'
                    : phase.status === 'active' ? 'secondary'
                      : 'outline'
                }
                className="ml-auto text-xs capitalize"
              >
                {phase.status}
              </Badge>
              <span className="text-xs text-muted-foreground">${phase.reward}</span>
            </div>
            <div className="pl-6 space-y-1">
              <Progress
                value={percent}
                className={cn(
                  'h-2',
                  phase.status === 'pending' && 'opacity-40'
                )}
              />
              <p className="text-xs text-muted-foreground">
                {filled} / {phase.slots} slots filled
                {phase.status === 'active' && !isFull && ` · ${remaining} remaining`}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}