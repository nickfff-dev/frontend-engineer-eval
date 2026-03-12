import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2, Pencil, X } from "lucide-react"
import type { SubmissionStatus, UserRole, User } from "@/types/types"

interface BulkBarBaseProps {
    selectedCount: number
    onClear: () => void
    isPending: boolean
}

// ── Task Bulk Edit ────────────────────────────────────────────────────────────

interface TaskBulkEditBarProps extends BulkBarBaseProps {
    onApply: (changes: { amount?: number; campaignId?: string, reward?: number }) => void
}

export function BulkEditBar({ selectedCount, onApply, onClear, isPending }: TaskBulkEditBarProps) {
    const [amount, setAmount] = useState("")
    const [campaignId, setCampaignId] = useState("")
    const [reward, setReward] = useState("")

    const hasChanges = amount !== "" || campaignId !== ""

    const handleApply = () => {
        const changes: { amount?: number; campaignId?: string, reward?: number } = {}
        if (amount !== "") changes.amount = Number(amount)
        if (reward !== "") changes.reward = Number(reward)
        if (campaignId !== "") changes.campaignId = campaignId
        onApply(changes)
        setAmount("")
        setCampaignId("")
    }

    return (
        <BulkBarShell selectedCount={selectedCount} onClear={onClear}>
            <div className="space-y-1">
                <Label className="text-xs">Set Amount ($)</Label>
                <Input
                    type="number"
                    min={0}
                    placeholder="Leave blank to skip"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="h-8 w-36"
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Set Reward ($)</Label>
                <Input
                    type="number"
                    min={0}
                    placeholder="Leave blank to skip"
                    value={reward}
                    onChange={(e) => setReward(e.target.value)}
                    className="h-8 w-36"
                />
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Set Campaign ID</Label>
                <Input
                    placeholder="Leave blank to skip"
                    value={campaignId}
                    onChange={(e) => setCampaignId(e.target.value)}
                    className="h-8 w-44"
                />
            </div>
            <ApplyButton hasChanges={hasChanges} isPending={isPending} onClick={handleApply} />
        </BulkBarShell>
    )
}

// ── Submission Bulk Edit ──────────────────────────────────────────────────────

interface SubmissionBulkEditBarProps extends BulkBarBaseProps {
    onApply: (changes: { status?: SubmissionStatus }) => void
}

export function SubmissionBulkEditBar({ selectedCount, onApply, onClear, isPending }: SubmissionBulkEditBarProps) {
    const [status, setStatus] = useState<string>("")

    const hasChanges = status !== ""

    const handleApply = () => {
        onApply({ status: status as SubmissionStatus })
        setStatus("")
    }

    return (
        <BulkBarShell selectedCount={selectedCount} onClear={onClear}>
            <div className="space-y-1">
                <Label className="text-xs">Set Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-8 w-36">
                        <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ApplyButton hasChanges={hasChanges} isPending={isPending} onClick={handleApply} />
        </BulkBarShell>
    )
}

// ── User Bulk Edit ────────────────────────────────────────────────────────────

interface UserBulkEditBarProps extends BulkBarBaseProps {
    onApply: (changes: { role?: UserRole; status?: User["status"] }) => void
}

export function UserBulkEditBar({ selectedCount, onApply, onClear, isPending }: UserBulkEditBarProps) {
    const [role, setRole] = useState<string>("")
    const [status, setStatus] = useState<string>("")

    const hasChanges = role !== "" || status !== ""

    const handleApply = () => {
        const changes: { role?: UserRole; status?: User["status"] } = {}
        if (role !== "") changes.role = role as UserRole
        if (status !== "") changes.status = status as User["status"]
        onApply(changes)
        setRole("")
        setStatus("")
    }

    return (
        <BulkBarShell selectedCount={selectedCount} onClear={onClear}>
            <div className="space-y-1">
                <Label className="text-xs">Set Role</Label>
                <Select value={role} onValueChange={setRole}>
                    <SelectTrigger className="h-8 w-32">
                        <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="worker">Worker</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-1">
                <Label className="text-xs">Set Status</Label>
                <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger className="h-8 w-32">
                        <SelectValue placeholder="Select…" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <ApplyButton hasChanges={hasChanges} isPending={isPending} onClick={handleApply} />
        </BulkBarShell>
    )
}

// ── Shared shell & button ─────────────────────────────────────────────────────

function BulkBarShell({
    selectedCount,
    onClear,
    children,
}: {
    selectedCount: number
    onClear: () => void
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-wrap items-end gap-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <Pencil className="h-4 w-4" />
                {selectedCount} row{selectedCount > 1 ? "s" : ""} selected
            </div>
            <div className="flex flex-wrap items-end gap-3 flex-1">
                {children}
            </div>
            <Button size="sm" variant="ghost" className="h-8 text-muted-foreground" onClick={onClear}>
                <X className="mr-1 h-3 w-3" /> Clear
            </Button>
        </div>
    )
}

function ApplyButton({
    hasChanges,
    isPending,
    onClick,
}: {
    hasChanges: boolean
    isPending: boolean
    onClick: () => void
}) {
    return (
        <Button size="sm" onClick={onClick} disabled={!hasChanges || isPending} className="h-8 self-end">
            {isPending
                ? <><Loader2 className="mr-1 h-3 w-3 animate-spin" /> Applying…</>
                : "Apply to Selected"
            }
        </Button>
    )
}