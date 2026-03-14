"use client";
import { useState, useEffect } from "react";
import { getTaskTypeLabel } from "@/lib/mock-data";
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Pencil } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/types/types";
import { useEditTask } from "@/hooks/use-tasks";
import { getSubmissionStatusBadgeColor } from "@/lib/mock-data";
import { MarkdownEditor } from "../markdown-editor";


interface TaskDetailsProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ── Inline details editor dialog ──────────────────────────────────────────────

function DetailsEditorDialog({
  value,
  open,
  onOpenChange,
  onSave,
}: {
  value: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (markdown: string) => void
}) {
  const [draft, setDraft] = useState(value)

  // Sync when opened with fresh value
  useEffect(() => { if (open) setDraft(value) }, [open, value])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Details</DialogTitle>
          <DialogDescription>
            Markdown supported — use the toolbar or type shortcuts
          </DialogDescription>
        </DialogHeader>

        <MarkdownEditor
          value={draft}
          onChange={setDraft}
          placeholder="Task details and instructions…"
          minHeight="min-h-72"
        />

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={() => { onSave(draft); onOpenChange(false) }}>
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Main task details dialog ──────────────────────────────────────────────────

export function TaskDetails({ task, open, onOpenChange }: TaskDetailsProps) {
  const { mutate: editTask, isPending } = useEditTask();
  const [editorOpen, setEditorOpen] = useState(false)

  const [form, setForm] = useState({
    status: "active" as Task["status"],
    details: "",
    amount: 0,
    reward: 0,
  });

  useEffect(() => {
    if (task) {
      setForm({
        status: task.status,
        details: task.details,
        amount: task.amount,
        reward: task.reward,
      });
    }
  }, [task]);

  if (!task) return null;

  const hasChanged =
    form.status !== task.status ||
    form.details !== task.details ||
    form.amount !== task.amount ||
    form.reward !== task.reward;

  const handleSave = () => {
    editTask(
      { id: task.id, data: form },
      {
        onSuccess: () => {
          toast.success("Task updated successfully");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to update task"),
      }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{task.title}</DialogTitle>
            <DialogDescription>
              {task.description}
              {task.campaignId && <><br />Campaign: {task.campaignId}</>}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 max-h-[70vh] overflow-y-auto no-scrollbar">
            {/* Read-only info */}
            <div className="grid grid-cols-2 gap-4 bg-muted/40 rounded-lg p-4">
              <div>
                <p className="text-xs text-muted-foreground">Task Type</p>
                <p className="font-medium capitalize">{getTaskTypeLabel(task.type)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Submissions</p>
                <p className="font-medium">{task.submissionsReceived}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Multiple Submissions</p>
                <p className="font-medium">{task.allowMultipleSubmissions ? "Allowed" : "Not allowed"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Created</p>
                <p className="font-medium">
                  {new Date(task.createdAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>
            </div>

            {/* Details — rendered markdown with edit trigger */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">Details</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 text-xs"
                  onClick={() => setEditorOpen(true)}
                >
                  <Pencil className="h-3 w-3" /> Edit
                </Button>
              </div>
              <div
                className="prose prose-sm max-w-none rounded-lg border bg-muted/20 px-4 py-3 text-sm cursor-pointer hover:bg-muted/40 transition-colors"
                onClick={() => setEditorOpen(true)}
              >
                {form.details
                  ? <p>{form.details}</p>
                  : <p className="text-muted-foreground italic">No details yet — click to add</p>
                }
              </div>
            </div>

            {/* Editable fields */}
            <div className="space-y-4 border-t pt-4">
              <p className="text-sm font-medium">Edit Task</p>

              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(val) => setForm((prev) => ({ ...prev, status: val as Task["status"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["active", "completed", "archived"] as Task["status"][]).map((s) => (
                      <SelectItem key={s} value={s}>
                        <Badge variant={getSubmissionStatusBadgeColor(s)} className="capitalize">{s}</Badge>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Amount ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.amount}
                    onChange={(e) => setForm((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Reward ($)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.reward}
                    onChange={(e) => setForm((prev) => ({ ...prev, reward: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanged || isPending} className="min-w-25">
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Details editor — separate dialog so it doesn't nest ── */}
      <DetailsEditorDialog
        value={form.details}
        open={editorOpen}
        onOpenChange={setEditorOpen}
        onSave={(markdown) => setForm((prev) => ({ ...prev, details: markdown }))}
      />
    </>
  );
}