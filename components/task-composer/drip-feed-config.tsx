'use client'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select, SelectContent, SelectItem,
    SelectTrigger, SelectValue,
} from '@/components/ui/select'
import type { DripFeed } from '@/types/types'

const INTERVAL_PRESETS = [
    { label: 'Every 30 minutes', value: 30 },
    { label: 'Every 1 hour', value: 60 },
    { label: 'Every 6 hours', value: 360 },
    { label: 'Every 12 hours', value: 720 },
    { label: 'Every 24 hours', value: 1440 },
]

interface DripFeedConfigProps {
    value: DripFeed
    onChange: (drip: DripFeed) => void
}

export function DripFeedConfig({ value, onChange }: DripFeedConfigProps) {
    const update = (field: keyof DripFeed, val: any) =>
        onChange({ ...value, [field]: val })

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium">Enable Drip Feed</p>
                    <p className="text-xs text-muted-foreground">
                        Release slots in controlled batches instead of all at once
                    </p>
                </div>
                <Switch
                    checked={value.enabled}
                    onCheckedChange={(checked) => update('enabled', checked)}
                />
            </div>

            {value.enabled && (
                <div className="grid grid-cols-2 gap-4 pl-2 border-l-2 border-primary/20">
                    <div className="space-y-1.5">
                        <Label className="text-xs">Slots per release</Label>
                        <Input
                            type="number" min={1}
                            value={value.dripAmount}
                            onChange={(e) => update('dripAmount', Number(e.target.value))}
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs">Release interval</Label>
                        <Select
                            value={String(value.dripInterval)}
                            onValueChange={(v) => update('dripInterval', Number(v))}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {INTERVAL_PRESETS.map((p) => (
                                    <SelectItem key={p.value} value={String(p.value)}>
                                        {p.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <p className="col-span-2 text-xs text-muted-foreground">
                        Releases <strong>{value.dripAmount}</strong> slots every{' '}
                        <strong>{INTERVAL_PRESETS.find((p) => p.value === value.dripInterval)?.label.replace('Every ', '')}</strong>
                    </p>
                </div>
            )}
        </div>
    )
}