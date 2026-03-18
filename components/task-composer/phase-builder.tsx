'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Plus, Trash2, GripVertical } from 'lucide-react'
import type { TaskPhase } from '@/types/types'

interface PhaseBuilderProps {
    phases: TaskPhase[]
    onChange: (phases: TaskPhase[]) => void
}

export function PhaseBuilder({ phases, onChange }: PhaseBuilderProps) {
    const addPhase = () => {
        const newPhase: TaskPhase = {
            id: crypto.randomUUID(),
            phaseIndex: phases.length + 1,
            phaseName: `Phase ${phases.length + 1}`,
            slots: 10,
            instructions: '',
            reward: 0,
            submissionsReceived: 0,
            status: phases.length === 0 ? 'active' : 'pending',
        }
        onChange([...phases, newPhase])
    }

    const updatePhase = (id: string, field: keyof TaskPhase, value: any) => {
        onChange(phases.map((p) => (p.id === id ? { ...p, [field]: value } : p)))
    }

    const removePhase = (id: string) => {
        const updated = phases
            .filter((p) => p.id !== id)
            .map((p, i) => ({ ...p, phaseIndex: i + 1, phaseName: `Phase ${i + 1}` }))
        // Re-set first as active
        if (updated.length > 0) updated[0] = { ...updated[0], status: 'active' }
        onChange(updated)
    }

    return (
        <div className="space-y-3">
            {phases.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                    No phases added — task will use standard single-phase behavior.
                </p>
            ) : (
                phases.map((phase, i) => (
                    <Card key={phase.id} className="border-l-4 border-l-primary/40">
                        <CardContent className="pt-4 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                                    Phase {phase.phaseIndex}
                                </span>
                                <Button
                                    type="button" size="icon" variant="ghost"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => removePhase(phase.id)}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-xs">Phase Name</Label>
                                    <Input
                                        value={phase.phaseName}
                                        onChange={(e) => updatePhase(phase.id, 'phaseName', e.target.value)}
                                        placeholder={`Phase ${phase.phaseIndex} — Launch`}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Slots</Label>
                                    <Input
                                        type="number" min={1}
                                        value={phase.slots}
                                        onChange={(e) => updatePhase(phase.id, 'slots', Number(e.target.value))}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <Label className="text-xs">Reward ($)</Label>
                                    <Input
                                        type="number" min={0}
                                        value={phase.reward}
                                        onChange={(e) => updatePhase(phase.id, 'reward', Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-xs">Instructions</Label>
                                    <Textarea
                                        value={phase.instructions}
                                        onChange={(e) => updatePhase(phase.id, 'instructions', e.target.value)}
                                        placeholder="What should workers do in this phase?"
                                        className="resize-none min-h-20"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))
            )}
            <Button type="button" variant="outline" size="sm" onClick={addPhase} className="w-full">
                <Plus className="mr-2 h-4 w-4" /> Add Phase
            </Button>
        </div>
    )
}