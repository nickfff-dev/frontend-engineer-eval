'use client'
import { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Droplets, Clock, CheckCircle2 } from 'lucide-react'
import type { Task } from '@/types/types'
import { getDripState } from '@/lib/phases'

export function DripStatus({ task }: { task: Task }) {
    const [, forceUpdate] = useState(0)

    // Re-render every minute to update countdown
    useEffect(() => {
        if (!task.dripFeed?.enabled) return
        const t = setInterval(() => forceUpdate((n) => n + 1), 60000)
        return () => clearInterval(t)
    }, [task.dripFeed?.enabled])

    if (!task.dripFeed?.enabled) return null

    const { state, slotsAvailable, nextReleaseLabel } = getDripState(task)
    const drip = task.dripFeed
    const totalSlots = Math.floor(task.amount / task.reward)
    const releasedPercent = Math.round((drip.totalReleased / totalSlots) * 100)

    return (
        <div className="space-y-2 rounded-lg border p-3 bg-muted/20">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
                    <Droplets className="h-4 w-4 text-sky-500" />
                    Drip Feed
                </div>
                <Badge
                    variant={state === 'active' ? 'default' : state === 'waiting' ? 'secondary' : 'outline'}
                    className="capitalize text-xs"
                >
                    {state === 'waiting' ? `Next in ${nextReleaseLabel}` : state}
                </Badge>
            </div>
            <Progress value={releasedPercent} className="h-1.5" />
            <div className="flex justify-between text-xs text-muted-foreground">
                <span>{drip.totalReleased} / {totalSlots} released</span>
                <span>{drip.dripAmount} slots every {drip.dripInterval >= 60 ? `${drip.dripInterval / 60}h` : `${drip.dripInterval}m`}</span>
            </div>
        </div>
    )
}