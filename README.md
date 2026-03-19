# TaskFlow — Phase 2 Documentation

Phase 2 introduces three major feature additions: **Task Phases**, **Drip Feed**, and **Bulk Upload**. These are additive — all existing standard task behavior is preserved.

---

## Table of Contents

- [Task Phases](#task-phases)
- [Drip Feed](#drip-feed)
- [Bulk Upload](#bulk-upload)
- [New Types](#new-types)
- [New Utilities](#new-utilities)
- [New Components](#new-components)
- [Updated Components](#updated-components)
- [Mock Data](#mock-data)

---

## Task Phases

Phases allow a single task to be broken into multiple sequential stages. Each phase must collect enough submissions to fill its slots before the next phase unlocks.

### How phases work

- A task can have zero phases (standard behavior) or one or more phases
- Phases run in order by `phaseIndex` — only one phase is `active` at a time
- A phase transitions from `active` → `completed` when `submissionsReceived >= slots`
- When a phase completes, the next phase automatically becomes `active` via `advancePhases()`
- The task-level `submissionsReceived` is always the sum of all phase submissions

### Phase statuses

| Status | Meaning |
|---|---|
| `active` | Currently open for submissions |
| `completed` | Slots filled — phase is locked |
| `pending` | Not yet unlocked — waiting for a prior phase to complete |

### Phase parameters

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique phase identifier |
| `phaseIndex` | `number` | 1-based display index |
| `phaseName` | `string` | Display name e.g. `"Phase 1 — Launch"` |
| `slots` | `number` | Number of completions required |
| `instructions` | `string` | Phase-specific instructions shown to workers |
| `reward` | `number` | Reward per submission for this phase (can differ per phase) |
| `submissionsReceived` | `number` | Current completion count |
| `status` | `'pending' \| 'active' \| 'completed'` | Current phase state |

### Worker experience

- Workers only see the **active phase** instructions and reward
- Workers can see **past phases they submitted to** in a collapsible section inside the submit dialog
- If all phases are complete, the task submit button is disabled

### Admin experience

- Task table shows a compact phase progress bar in a dedicated column
- Task detail page has a dedicated **Phases tab** showing all phases, per-phase progress bars, instructions, and per-phase submission lists
- The **Edit tab** on the task detail page includes a full `PhaseBuilder` for adding, editing, and removing phases
- Task composer includes the `PhaseBuilder` when creating new tasks

### Submission tracking

Every submission now carries an optional `phaseId` field linking it to the phase it was submitted under. This allows per-phase submission filtering and display.

---

## Drip Feed

Drip feed is a slot release mechanism that exposes slots in controlled batches rather than all at once. It is configured at the task level and applies to the current active phase.

### Drip feed states

| State | Meaning |
|---|---|
| `active` | A batch has been released and slots are available |
| `waiting` | Current batch is exhausted — next release is scheduled |
| `completed` | All slots across all batches have been released |

### Drip feed parameters

| Field | Type | Description | Default |
|---|---|---|---|
| `enabled` | `boolean` | Whether drip feed is active | `false` |
| `dripAmount` | `number` | How many slots to release per interval | — |
| `dripInterval` | `number` | Interval in **minutes** between releases | — |
| `totalReleased` | `number` | Cumulative slots released so far | `0` |
| `lastReleasedAt` | `Date` | Timestamp of the most recent release | — |

### Available interval presets

| Label | Minutes |
|---|---|
| Every 30 minutes | 30 |
| Every 1 hour | 60 |
| Every 6 hours | 360 |
| Every 12 hours | 720 |
| Every 24 hours | 1440 |

### How drip state is computed

Drip state is computed **client-side** from `lastReleasedAt` + `dripInterval` — no server cron is required for the mock implementation:

```typescript
const elapsed = Date.now() - new Date(drip.lastReleasedAt).getTime()
const intervalMs = drip.dripInterval * 60 * 1000

if (elapsed >= intervalMs) → state: 'active'   // ready to release
if (elapsed <  intervalMs) → state: 'waiting'  // show countdown
if (totalReleased >= totalSlots) → state: 'completed'
```

The `DripStatus` component re-renders every 60 seconds via `setInterval` to keep the countdown live.

### Worker experience

- Task cards show a `DripPill` badge indicating the current drip state
- Drip-blocked tasks (state: `waiting` or `completed`) have their submit button disabled with a "Waiting" label
- The submit dialog shows a `DripBanner` with a progress bar, slots available now, and next release countdown

### Admin experience

- Task table shows a drip state badge in a dedicated column
- Task detail page overview tab shows a full `DripStatus` widget with release progress
- The **Edit tab** includes a `DripFeedConfig` toggle to enable/disable and configure drip parameters
- Task composer includes drip feed configuration when creating new tasks

---

## Bulk Upload

Admins can create multiple tasks at once by uploading a CSV file.

### How to use

1. Navigate to the Task Composer and select the **Bulk Upload** tab
2. Drag and drop a CSV file onto the upload zone, or click to browse
3. The file is parsed and previewed — each row becomes one task
4. Click **Create N Tasks** to submit all tasks sequentially

### CSV format

Download the template from the upload UI. Required and optional columns:

| Column | Required | Description |
|---|---|---|
| `title` | ✅ | Task title |
| `type` | ✅ | One of: `social_media_posting`, `email_sending`, `social_media_liking` |
| `description` | — | Short description |
| `details` | — | Full instructions (plain text; markdown supported) |
| `amount` | — | Total task budget in dollars |
| `reward` | — | Reward per submission in dollars |
| `allowMultipleSubmissions` | — | `true` or `false` |
| `campaignId` | — | Optional campaign reference |

### Validation

- Rows missing `title` or `type` are rejected with a row-level error message
- Valid rows are previewed before submission — each shows title, type, and reward
- Tasks are created sequentially (not in parallel) to avoid localStorage race conditions
- A toast reports how many succeeded out of the total attempted

---

## New Types

Added to `lib/types.ts`:

```typescript
export interface TaskPhase {
  id: string
  phaseIndex: number
  phaseName: string
  slots: number
  instructions: string
  reward: number
  submissionsReceived: number
  status: 'pending' | 'active' | 'completed'
}

export interface DripFeed {
  enabled: boolean
  dripAmount: number
  dripInterval: number    // minutes
  lastReleasedAt?: Date
  totalReleased: number
}

// Task interface extended with:
phases?: TaskPhase[]
dripFeed?: DripFeed

// Submission interface extended with:
phaseId?: string
```

---

## New Utilities

### `lib/phases.ts`

| Function | Description |
|---|---|
| `getActivePhase(task)` | Returns the first phase with `status === 'active'`, or `null` |
| `getPhaseProgress(phase)` | Returns `{ percent, filled, remaining, isFull }` |
| `advancePhases(phases)` | Marks the current active phase as completed and opens the next one |
| `getDripState(task)` | Returns `{ state, slotsAvailable, nextReleaseMs, nextReleaseLabel }` |
| `releaseDrip(task)` | Returns an updated task object with a new drip batch released |
| `formatDuration(ms)` | Formats milliseconds into a human-readable string e.g. `"5h 30m"` |

---

## New Components

| Component | Location | Description |
|---|---|---|
| `PhaseBuilder` | `components/task-composer/phase-builder.tsx` | Add/edit/remove phases in a form — used in both composer and task details edit |
| `DripFeedConfig` | `components/task-composer/drip-feed-config.tsx` | Toggle and configure drip feed — used in both composer and task details edit |
| `BulkUpload` | `components/task-composer/bulk-upload.tsx` | CSV drag-drop upload with preview and template download |
| `PhaseProgress` | `components/phase-progress.tsx` | Full phase timeline with progress bars — `compact` prop for table cells |
| `DripStatus` | `components/drip-status.tsx` | Drip progress widget with live countdown — auto-refreshes every 60s |
| `ActivePhaseBanner` | `components/phases/pill-assets.tsx` | Phase context banner shown in the worker submit dialog |
| `DripBanner` | `components/phases/pill-assets.tsx` | Drip state banner shown in the worker submit dialog |
| `PhasePill` | Inside `task-feed.tsx` | Compact phase progress shown on task cards |
| `DripPill` | Inside `task-feed.tsx` | Compact drip state badge shown on task cards |

---

## Updated Components

### `task-feed.tsx`
- Task cards show phase progress pill and drip state badge when applicable
- Submit dialog shows `ActivePhaseBanner` (phase progress + past phases collapsible) and `DripBanner`
- `handleSubmit` validates drip state → phase state → slots → duplicates in that order
- On success, `advancePhases()` is called if the submission fills the active phase
- All submissions carry a `phaseId` if submitted under a phase
- Filter bar gains two new selects: **Phases** (all / phased only / standard only) and **Drip Feed** (all / drip only / no drip)
- Active filters shown as removable badges with a "Clear all" shortcut

### `task-composer.tsx`
- Wrapped in a `Tabs` component — **Single Task** and **Bulk Upload** tabs
- Single task form includes `PhaseBuilder` and `DripFeedConfig` sections below the core fields
- `phases` and `dripFeed` are local state outside react-hook-form, merged into the task object on submit
- Reset clears phases and drip feed alongside the form

### `task-detail/index.tsx` (new page)
- Accessible at `/tasks/[id]`
- **Overview tab** — rendered markdown details, metadata grid, phase progress summary, drip status widget
- **Submissions tab** — status summary cards + full submission list with evidence thumbnails
- **Phases tab** — per-phase cards with progress bars, instructions, and per-phase submission lists (only shown for phased tasks)
- **Edit tab** — inline editable fields for status, amount, reward, markdown details, `PhaseBuilder`, and `DripFeedConfig`

### `task-table/index.tsx`
- Table rows are now clickable — navigates to `/tasks/[id]`
- View Details dropdown item also navigates to the task page
- `TaskDetails` dialog removed — all detail viewing happens on the dedicated page

### `task-table/build-columns.tsx`
- Added `phases` column showing `PhaseProgress` in compact mode
- Added `drip` column showing drip state badge
- `onView` callback replaced with `router.push('/tasks/[id]')`

### `performance.tsx` (worker)
- Phase activity card showing phase submission count and campaigns joined
- Submission history rows show phase badge when relevant
- Clicking any submission row opens a detail dialog with full evidence, phase context, and reward info
- "Open for submission" section showing tasks the worker can still submit to with phase/drip context

---

## Mock Data

`MOCK_TASKS` updated with:

| Task | Feature |
|---|---|
| `task-6` | Drip feed — 10 slots every 24h, currently in `waiting` state |
| `task-7` | 3-phase campaign — phase 1 completed (20 slots), phase 2 active (14/50), phase 3 pending |
| `task-8` | 2-phase + drip feed — phase 1 active with 6-hour drip |

All tasks satisfy `amount = reward × slots`. Task-level `submissionsReceived` equals the sum of all phase `submissionsReceived` for phased tasks.

`MOCK_SUBMISSIONS` updated with phase-linked submissions (`sub-6`, `sub-7`) for `task-7` demonstrating worker phase history, and `sub-8` for the drip task.