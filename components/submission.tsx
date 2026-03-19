import { getSubmissionStatusBadgeColor, getTaskTypeLabel } from "@/lib/mock-data"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Layers, DollarSign, Link, ExternalLink, Mail, ImageIcon, Info, ChevronRight } from "lucide-react"
import { Button } from "./ui/button"
import { DialogHeader, DialogFooter } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Submission, Task } from "@/types/types"

interface EnrichedSubmission extends Submission {
  task: Task | null
  phase: { phaseName: string; phaseIndex: number; reward: number } | null
}

export function SubmissionDetailDialog({
  submission,
  open,
  onOpenChange,
}: {
  submission: EnrichedSubmission | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!submission) return null
  const { task, phase } = submission

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="leading-snug">
            {task?.title ?? 'Submission Details'}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs">{submission.id}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Status + dates */}
          <div className="grid grid-cols-2 gap-4 bg-muted/40 rounded-lg p-4">
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge
                variant={getSubmissionStatusBadgeColor(submission.status)}
                className="capitalize mt-1"
              >
                {submission.status}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Task Type</p>
              <p className="text-sm font-medium mt-1">
                {task ? getTaskTypeLabel(task.type) : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Submitted</p>
              <p className="text-sm font-medium mt-1">
                {new Date(submission.submittedAt).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric',
                })}
              </p>
            </div>
            {submission.reviewedAt && (
              <div>
                <p className="text-xs text-muted-foreground">Reviewed</p>
                <p className="text-sm font-medium mt-1">
                  {new Date(submission.reviewedAt).toLocaleDateString('en-US', {
                    year: 'numeric', month: 'short', day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Phase info */}
          {phase && (
            <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
              <Layers className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Phase</p>
                <p className="text-sm font-medium">
                  Phase {phase.phaseIndex} — {phase.phaseName}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-xs text-muted-foreground">Reward</p>
                <p className="text-sm font-bold text-green-700">${phase.reward}</p>
              </div>
            </div>
          )}

          {/* Reward */}
          {!phase && task && (
            <div className="flex items-center justify-between rounded-lg bg-green-50 border border-green-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  {submission.status === 'approved' ? 'Earned' : 'Potential reward'}
                </span>
              </div>
              <span className="text-lg font-bold text-green-700">${task.reward}</span>
            </div>
          )}

          {/* Submission data */}
          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Submitted Evidence
            </p>

            {submission.data.postUrl && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Link className="h-3 w-3" /> Post URL
                </p>
                <a
                  href={submission.data.postUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-600 hover:underline truncate"
                >
                  {submission.data.postUrl}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </div>
            )}

            {submission.data.emailContent && (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> Email Content
                </p>
                <p className="text-sm bg-muted rounded-lg p-3 leading-relaxed">
                  {submission.data.emailContent}
                </p>
              </div>
            )}

            {submission.data.evidenceScreenshot && (
              <div className="space-y-1.5">
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <ImageIcon className="h-3 w-3" /> Evidence Screenshot
                </p>
                <img
                  src={submission.data.evidenceScreenshot}
                  alt="Evidence"
                  className="rounded-lg border w-full object-cover max-h-52"
                />
              </div>
            )}
          </div>

          {/* Rejection note */}
          {submission.status === 'rejected' && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-100 p-3">
              <Info className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-xs text-destructive">
                This submission was rejected. You may be able to resubmit if the task allows multiple submissions.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ── Submission row ────────────────────────────────────────────────────────────

export function SubmissionRow({
  submission,
  onClick,
}: {
  submission: EnrichedSubmission
  onClick: () => void
}) {
  const { task, phase } = submission
  const reward = phase?.reward ?? task?.reward ?? 0

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between rounded-lg border p-4 hover:bg-muted/40 transition-colors text-left group"
    >
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-slate-900 truncate text-sm">
            {task?.title ?? submission.taskId}
          </p>
          {phase && (
            <Badge variant="outline" className="text-xs gap-1 shrink-0">
              <Layers className="h-2.5 w-2.5" />
              Phase {phase.phaseIndex}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {task && (
            <Badge variant="secondary" className="text-xs capitalize">
              {getTaskTypeLabel(task.type)}
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(submission.submittedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })}
          </span>
          {submission.status === 'approved' && (
            <span className="text-xs font-semibold text-green-700">+${reward}</span>
          )}
          {submission.status === 'pending' && (
            <span className="text-xs text-amber-600">pending · ${reward} potential</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0 ml-3">
        <Badge
          variant={getSubmissionStatusBadgeColor(submission.status)}
          className="capitalize text-xs"
        >
          {submission.status}
        </Badge>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
      </div>
    </button>
  )
}