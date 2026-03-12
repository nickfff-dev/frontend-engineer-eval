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
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Task } from "@/types/types";
import { useEditTask } from "@/hooks/use-tasks";
import { getSubmissionStatusBadgeColor } from "@/lib/mock-data";

interface TaskDetailsProps {
  task: Task | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TaskDetails({ task, open, onOpenChange }: TaskDetailsProps) {
  const { mutate: editTask, isPending } = useEditTask();

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription>{task.description}<br />
            Campaign: {task.campaignId}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Read-only */}
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

          {/* Editable */}
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

            <div className="space-y-1.5">
              <Label>Details</Label>
              <Textarea
                value={form.details}
                onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
                className="resize-none min-h-24"
              />
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
  );
}