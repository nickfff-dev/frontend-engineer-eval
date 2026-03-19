// build-columns.tsx
"use client";
import { type ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown, Eye, Trash2, Layers, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import type { Task } from "@/types/types";
import { getTaskTypeLabel, getSubmissionStatusBadgeColor, getTaskSlots } from "@/lib/mock-data";
import { getActivePhase, getDripState } from "@/lib/phases";

// ── Compact phase indicator ───────────────────────────────────────────────────

function PhaseCell({ task }: { task: Task }) {
  if (!task.phases?.length) return <span className="text-xs text-muted-foreground">—</span>
  const active = getActivePhase(task)
  const completed = task.phases.filter((p) => p.status === 'completed').length
  const current = active ?? task.phases[task.phases.length - 1]
  const pct = current.slots > 0
    ? Math.round((current.submissionsReceived / current.slots) * 100)
    : 100

  return (
    <div className="space-y-1 min-w-20">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground flex items-center gap-0.5">
          <Layers className="h-2.5 w-2.5" />
          {completed}/{task.phases.length}
        </span>
        <span className="font-medium text-xs">{pct}%</span>
      </div>
      <Progress value={pct} className="h-1" />
    </div>
  )
}

// ── Compact slots cell ────────────────────────────────────────────────────────

function SlotsCell({ task }: { task: Task }) {
  const { maxSlots, slotsRemaining, isFull } = getTaskSlots(task)
  return (
    <span className={`text-xs font-medium tabular-nums ${isFull ? 'text-destructive' : slotsRemaining <= 3 ? 'text-amber-600' : 'text-foreground'
      }`}>
      {task.submissionsReceived}/{maxSlots}
    </span>
  )
}

// ── Compact drip indicator ────────────────────────────────────────────────────

function DripCell({ task }: { task: Task }) {
  if (!task.dripFeed?.enabled) return <span className="text-xs text-muted-foreground">—</span>
  const { state, nextReleaseLabel } = getDripState(task)
  return (
    <Badge
      variant={state === 'active' ? 'default' : state === 'waiting' ? 'secondary' : 'outline'}
      className="text-xs gap-1 whitespace-nowrap"
    >
      <Droplets className="h-2.5 w-2.5" />
      {state === 'waiting' ? nextReleaseLabel : state}
    </Badge>
  )
}

// ── Actions cell — needs router so extracted as component ─────────────────────

function ActionsCell({ task, onDelete }: { task: Task; onDelete: (task: Task) => void }) {
  const router = useRouter()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-7 w-7 p-0" variant="ghost">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(task.id)}>
          Copy Task ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push(`/tasks/${task.id}`)}>
          <Eye className="mr-2 h-4 w-4" /> View Details
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => onDelete(task)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Column definitions ────────────────────────────────────────────────────────

export function buildColumns(
  onDelete: (task: Task) => void
): ColumnDef<Task>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          aria-label="Select all"
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          aria-label="Select row"
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          // Stop row click from propagating to router
          onClick={(e) => e.stopPropagation()}
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 40,
    },
    {
      // Title + type combined
      accessorKey: "title",
      header: "Task",
      cell: ({ row }) => {
        const task = row.original
        return (
          <div className="min-w-0">
            <p className="font-medium text-sm truncate max-w-45">{task.title}</p>
            <p className="text-xs text-muted-foreground capitalize">
              {getTaskTypeLabel(task.type).split(' ')[0]}
              {task.campaignId && (
                <span className="ml-1 text-muted-foreground/60">· {task.campaignId}</span>
              )}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: "Type",
      cell: ({ row }) => (
        <span className="capitalize text-sm">
          {getTaskTypeLabel(row.getValue("type"))}
        </span>
      ),
    },
    {
      // Status + drip combined
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const task = row.original
        return (
          <div className="flex flex-col gap-1">
            <Badge
              variant={getSubmissionStatusBadgeColor(task.status)}
              className="capitalize text-xs w-fit"
            >
              {task.status}
            </Badge>
            {task.dripFeed?.enabled && <DripCell task={task} />}
          </div>
        )
      },
    },
    {
      // Slots: submitted/total
      id: "slots",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Slots <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => <SlotsCell task={row.original} />,
      accessorFn: (row) => row.submissionsReceived,
    },
    {
      // Reward
      accessorKey: "reward",
      header: ({ column }) => (
        <Button
          variant="ghost"
          className="px-0 text-xs"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Reward <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-green-700">
          ${row.getValue("reward")}
        </span>
      ),
    },
    {
      // Phases — only renders content if task has phases
      id: "phases",
      header: "Phases",
      cell: ({ row }) => <PhaseCell task={row.original} />,
    },
    {
      id: "actions",
      enableHiding: false,
      size: 40,
      cell: ({ row }) => (
        <ActionsCell
          task={row.original}
          onDelete={onDelete}
        />
      ),
    },
  ]
}