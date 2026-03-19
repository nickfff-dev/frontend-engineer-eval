'use client';
import { getActivePhase, getDripState } from '@/lib/phases'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
    CheckCircle2, Droplets,
    ChevronRight, Layers,
} from 'lucide-react'
import type { TaskPhase } from '@/types/types'
import type { Task } from '@/types/types'


// ── Phase pill shown on card ──────────────────────────────────────────────────

export function PhasePill({ phase, total }: { phase: TaskPhase; total: number }) {
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

export function DripPill({ task }: { task: Task }) {
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


// ── Active phase banner in submit dialog ──────────────────────────────────────

export function ActivePhaseBanner({ task }: { task: Task }) {
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

export function DripBanner({ task }: { task: Task }) {
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
