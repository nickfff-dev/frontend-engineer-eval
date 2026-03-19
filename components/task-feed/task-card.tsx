'use client';
import { getTaskTypeLabel, getTaskSlots } from '@/lib/mock-data'
import { getActivePhase, getDripState, } from '@/lib/phases'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
    ArrowRight, DollarSign, Users, Clock,
    CheckCircle2,
} from 'lucide-react'
import type { Task } from '@/types/types'
import { PhasePill, DripPill } from '../phases/pill-assest';

interface TaskCardProps {
    task: Task
    isCompleted: boolean
    onSelect: (task: Task) => void
}

export function TaskCard({ task, isCompleted, onSelect }: TaskCardProps) {
    const { maxSlots, slotsRemaining, isFull } = getTaskSlots(task)
    const activePhase = getActivePhase(task)
    const dripState = task.dripFeed?.enabled ? getDripState(task) : null
    const dripBlocked = dripState?.state === 'waiting' || dripState?.state === 'completed'
    const effectiveReward = activePhase ? activePhase.reward : task.reward
    const disabled = (isCompleted && !task.allowMultipleSubmissions) || isFull || dripBlocked

    return (
        <Card
            className={`flex flex-col transition-all duration-200 ${disabled
                ? 'opacity-60 cursor-not-allowed bg-muted/30'
                : 'hover:border-primary/40 hover:shadow-md cursor-pointer group'
                }`}
            onClick={() => !disabled && onSelect(task)}
        >
            <CardHeader className="pb-2 p-4">
                <div className="flex items-start justify-between gap-2">
                    <h3 className={`font-semibold leading-snug text-sm ${disabled ? 'text-muted-foreground' : 'text-slate-900 group-hover:text-primary transition-colors'
                        }`}>
                        {task.title}
                    </h3>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                        {isCompleted && !task.allowMultipleSubmissions && (
                            <Badge variant="secondary" className="text-xs gap-1">
                                <CheckCircle2 className="h-2.5 w-2.5" /> Done
                            </Badge>
                        )}
                        {isFull && (
                            <Badge variant="destructive" className="text-xs">Full</Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                            {getTaskTypeLabel(task.type).split(' ')[0]}
                        </Badge>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{task.description}</p>
            </CardHeader>

            <CardContent className="flex-1 pb-2 px-4 space-y-2">
                {/* Phase progress */}
                {task.phases?.length && activePhase && (
                    <PhasePill phase={activePhase} total={task.phases.length} />
                )}

                {/* Drip badge */}
                {task.dripFeed?.enabled && <DripPill task={task} />}

                {/* Slots */}
                <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-slate-100 pt-2">
                    <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {task.submissionsReceived}/{maxSlots} slots
                    </span>
                    <span className={`font-medium ${isFull ? 'text-destructive' : slotsRemaining <= 3 ? 'text-amber-600' : 'text-emerald-600'
                        }`}>
                        {isFull ? 'Full' : `${slotsRemaining} left`}
                    </span>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {task.allowMultipleSubmissions ? 'Multiple allowed' : 'One per person'}
                </div>
            </CardContent>

            <CardFooter className="flex items-center justify-between pt-0 px-4 pb-4">
                <div className="flex items-center gap-0.5 font-bold">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="text-green-700 text-lg">{effectiveReward}</span>
                    {activePhase && (
                        <span className="text-xs text-muted-foreground font-normal ml-1">this phase</span>
                    )}
                </div>
                <Button
                    size="sm"
                    disabled={disabled}
                    className="h-8 text-xs"
                    onClick={(e) => { e.stopPropagation(); if (!disabled) onSelect(task) }}
                >
                    {disabled
                        ? dripBlocked ? 'Waiting' : isFull ? 'Full' : 'Done'
                        : <><span>Submit</span><ArrowRight className="ml-1 h-3 w-3" /></>
                    }
                </Button>
            </CardFooter>
        </Card>
    )
}
