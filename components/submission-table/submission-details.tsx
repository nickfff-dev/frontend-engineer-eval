"use client";
import { useState, useEffect, useMemo } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { Submission, SubmissionStatus } from "@/types/types";
import { getSubmissionStatusBadgeColor } from "@/lib/mock-data";
import { useEditSubmission } from "@/hooks/use-submissions";
import { useTasks } from "@/hooks/use-tasks";
import { useUsers } from "@/hooks/use-users";
import React from "react";

interface SubmissionDetailsProps {
  submission: Submission | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: SubmissionStatus[] = ["pending", "approved", "rejected"];

export function SubmissionDetails({ submission, open, onOpenChange }: SubmissionDetailsProps) {
  const { data: tasks } = useTasks();
  const { data: users } = useUsers();
  const { mutate: editSubmission, isPending } = useEditSubmission();
  const [status, setStatus] = useState<SubmissionStatus>("pending");
  const sub_task = React.useMemo(() => {
    if (tasks) {
      return tasks.find(t => t.id === submission?.taskId)
    }
  }, [tasks, submission])

  const owner = React.useMemo(() => {
    return users?.find(u => u.id === submission?.workerId)
  }, [users, submission])

  useEffect(() => {
    if (submission) setStatus(submission.status);
  }, [submission]);

  if (!submission) return null;

  const hasChanged = status !== submission.status;

  const handleSave = () => {
    editSubmission(
      {
        id: submission.id,
        data: {
          status,
          reviewedAt: status !== "pending" ? new Date() : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success("Submission updated");
          onOpenChange(false);
        },
        onError: () => toast.error("Failed to update submission"),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Submission Details</DialogTitle>
          <DialogDescription className="font-mono text-xs">{sub_task?.title ?? submission.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Read-only */}
          <div className="grid grid-cols-2 gap-4 bg-muted/40 rounded-lg p-4">
            <div>
              <p className="text-xs text-muted-foreground">Task ID</p>
              <p className="font-mono text-sm truncate">{submission.taskId}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Owner</p>
              <p className="font-mono text-sm truncate">{owner?.name ?? ""}</p>
              <p className="font-mono text-sm truncate">{owner?.email ?? ""}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted At</p>
              <p className="font-medium">
                {new Date(submission.submittedAt).toLocaleDateString("en-US", {
                  year: "numeric", month: "short", day: "numeric",
                })}
              </p>
            </div>
            {submission.reviewedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Reviewed At</p>
                <p className="font-medium">
                  {new Date(submission.reviewedAt).toLocaleDateString("en-US", {
                    year: "numeric", month: "short", day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Status editor */}
          <div className="space-y-1.5 border-t pt-4">
            <Label>Status</Label>
            <Select value={status} onValueChange={(val) => setStatus(val as SubmissionStatus)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    <Badge variant={getSubmissionStatusBadgeColor(s)} className="capitalize">{s}</Badge>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasChanged && status !== "pending" && (
              <p className="text-xs text-muted-foreground">Saving will set the reviewed date to today.</p>
            )}
          </div>

          {/* Submission data */}
          <div className="space-y-2 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground">Submission Data</p>
            {submission.data.postUrl && (
              <div className="md:w-md w-48">
                <p className="text-xs text-muted-foreground">Post URL</p>
                <a href={submission.data.postUrl} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-600 hover:underline truncate block">
                  {submission.data.postUrl}
                </a>
              </div>
            )}
            {submission.data.emailContent && (
              <div>
                <p className="text-xs text-muted-foreground">Email Content</p>
                <p className="text-sm bg-muted rounded p-2">{submission.data.emailContent}</p>
              </div>
            )}
            {submission.data.evidenceScreenshot && (
              <div>
                <p className="text-xs text-muted-foreground mb-1">Evidence Screenshot</p>
                <img src={submission.data.evidenceScreenshot} alt="Evidence"
                  className="rounded border w-full object-cover max-h-48" />
              </div>
            )}
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