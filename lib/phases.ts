import type { Task, TaskPhase, DripFeed } from '@/types/types'

// ── Phase helpers ─────────────────────────────────────────────────────────────

export function getActivePhase(task: Task): TaskPhase | null {
    if (!task.phases?.length) return null
    return task.phases.find((p) => p.status === 'active') ?? null
}

export function getPhaseProgress(phase: TaskPhase): {
    percent: number
    filled: number
    remaining: number
    isFull: boolean
} {
    const filled = phase.submissionsReceived
    const remaining = Math.max(0, phase.slots - filled)
    const percent = phase.slots > 0 ? Math.round((filled / phase.slots) * 100) : 0
    return { percent, filled, remaining, isFull: remaining === 0 }
}

// Advance phases — call after a submission is approved or slots fill
export function advancePhases(phases: TaskPhase[]): TaskPhase[] {
    const updated = [...phases]
    for (let i = 0; i < updated.length; i++) {
        const phase = updated[i]
        if (phase.status === 'active' && phase.submissionsReceived >= phase.slots) {
            updated[i] = { ...phase, status: 'completed' }
            const next = updated[i + 1]
            if (next) updated[i + 1] = { ...next, status: 'active' }
        }
    }
    return updated
}

// ── Drip Feed helpers ─────────────────────────────────────────────────────────

export type DripState = 'active' | 'waiting' | 'completed'

export function getDripState(task: Task): {
    state: DripState
    slotsAvailable: number
    nextReleaseMs: number | null   // ms until next release, null if not waiting
    nextReleaseLabel: string | null
} {
    const drip = task.dripFeed
    if (!drip?.enabled) {
        // No drip — all slots available via normal getTaskSlots
        return { state: 'active', slotsAvailable: Infinity, nextReleaseMs: null, nextReleaseLabel: null }
    }

    const activePhase = getActivePhase(task)
    const totalSlots = activePhase?.slots ?? Math.floor(task.amount / task.reward)

    if (drip.totalReleased >= totalSlots) {
        return { state: 'completed', slotsAvailable: 0, nextReleaseMs: null, nextReleaseLabel: null }
    }

    const intervalMs = drip.dripInterval * 60 * 1000
    const lastReleased = drip.lastReleasedAt ? new Date(drip.lastReleasedAt).getTime() : 0
    const now = Date.now()
    const elapsed = now - lastReleased
    const slotsAvailable = Math.max(0, drip.totalReleased - (activePhase?.submissionsReceived ?? task.submissionsReceived))

    if (elapsed >= intervalMs) {
        // Time for a new release
        return { state: 'active', slotsAvailable: drip.dripAmount, nextReleaseMs: null, nextReleaseLabel: null }
    }

    const remaining = intervalMs - elapsed
    const nextReleaseLabel = formatDuration(remaining)
    return { state: 'waiting', slotsAvailable, nextReleaseMs: remaining, nextReleaseLabel }
}

function formatDuration(ms: number): string {
    const h = Math.floor(ms / 3600000)
    const m = Math.floor((ms % 3600000) / 60000)
    if (h > 0) return `${h}h ${m}m`
    return `${m}m`
}

// Trigger a drip release — call on a timer or on task load
export function releaseDrip(task: Task): Task {
    if (!task.dripFeed?.enabled) return task
    const { state } = getDripState(task)
    if (state !== 'active') return task

    return {
        ...task,
        dripFeed: {
            ...task.dripFeed,
            totalReleased: task.dripFeed.totalReleased + task.dripFeed.dripAmount,
            lastReleasedAt: new Date(),
        },
    }
}