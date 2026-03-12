# TaskFlow — Crowdsourced Task Management Platform

A full-featured task management and crowdsourcing platform built with Next.js, where admins create and manage tasks, workers browse and submit completions, and both roles can track performance — all powered by TanStack Query and a localStorage mock backend.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features](#features)
- [Data Layer](#data-layer)
- [Authentication](#authentication)
- [Role-Based Access](#role-based-access)
- [Hooks Reference](#hooks-reference)
- [Component Architecture](#component-architecture)
- [Getting Started](#getting-started)
- [Known Limitations](#known-limitations)

---

## Overview

TaskFlow lets administrators compose tasks (social media posting, email sending, social media liking), manage submissions from workers, and oversee users. Workers browse the task feed, submit evidence for completed tasks, and track their earnings and approval rates on a performance dashboard.

The entire backend is simulated using `localStorage` — making the app fully self-contained with no server required. All async operations use realistic delays to simulate network latency.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| UI Components | shadcn/ui |
| Data Fetching | TanStack Query v5 |
| Tables | TanStack Table v8 |
| Mock Backend | localStorage |
| Notifications | Sonner |
| Icons | Lucide React |

---

## Project Structure

```
├── app/
│   ├── dashboard/          # Main dashboard page
│   ├── feed/               # Worker task feed page
│   ├── tasks/
│   │   ├── composer/       # Admin task creation
│   │   └── management/     # Admin task table
│   ├── submissions/        # Admin submissions table
│   ├── users/              # Admin user management table
│   ├── performance/        # Worker performance dashboard
│   └── settings/           # User settings page
│
├── components/
│   ├── task-table/
│   │   ├── components/
│   │   │   ├── build-columns.tsx
│   │   │   └── task-details.tsx
│   │   └── index.tsx
│   ├── submission-table/
│   │   ├── components/
│   │   │   ├── build-columns.tsx
│   │   │   └── submission-details.tsx
│   │   └── index.tsx
│   ├── user-table/
│   │   ├── components/
│   │   │   ├── build-columns.tsx
│   │   │   └── user-details.tsx
│   │   └── index.tsx
│   ├── task-feed.tsx        # Worker task browsing + submission
│   ├── performance.tsx      # Worker stats dashboard
│   ├── settings.tsx         # Account settings
│   ├── metrics-grid.tsx     # Dashboard stat cards
│   ├── recent-tasks.tsx     # Dashboard recent tasks list
│   └── unauthenticated.tsx  # Auth guard fallback UI
│
├── context/
│   └── AuthContext.tsx      # Auth provider + useAuth hook
│
├── hooks/
│   ├── use-tasks.ts
│   ├── use-submissions.ts
│   └── use-users.ts
│
└── lib/
    ├── mock-data.ts         # localStorage CRUD + seed data
    └── types.ts             # All TypeScript interfaces
```

---

## Features

### Admin

| Feature | Description |
|---|---|
| **Task Composer** | Create tasks with type, title, description, details, amount, reward, and multi-submission toggle |
| **Task Management** | Full TanStack Table with sort, filter by status/type, search by title, inline edit (status, details, amount, reward), delete |
| **Submission Review** | View all submissions, update status (pending → approved/rejected), auto-sets `reviewedAt` on review, delete |
| **User Management** | View all users, update role and status, change profile picture |
| **Dashboard** | Metrics grid (active tasks, total/approved/pending submissions) + recent tasks list |

### Worker

| Feature | Description |
|---|---|
| **Task Feed** | Browse active tasks, filter by type, sort by newest/reward, tasks already submitted are greyed out |
| **Task Submission** | Submit post URL, email content, or evidence screenshot (stored as base64) per task type |
| **Performance** | Stats: total submitted, approved count, approval rate, total earned, top category; full submission history |
| **Settings** | Update profile picture, change password, view session info |

### Shared

- Session-based authentication persisted in `localStorage`
- Role-based sidebar navigation (admin sees all routes, worker sees limited routes)
- Skeleton loading states on all data-fetched views
- Toast notifications for all mutations

---

## Data Layer

All data is persisted in `localStorage` under three keys: `tasks`, `submissions`, `users`. On first load, each collection is seeded from its `MOCK_*` constant if no data exists yet.

### Filter API

All read functions accept an optional array of filters. Each filter targets one field:

```typescript
type Filter<T> = { field: keyof T; value: any }

// Examples
getTasks()                                          // all tasks
getTasks([{ field: 'status', value: 'active' }])   // active tasks only
getSubmissions([
  { field: 'workerId', value: 'abc' },
  { field: 'status',   value: 'pending' },
])                                                  // pending subs for one worker
```

### CRUD Functions (`lib/mock-data.ts`)

```typescript
// Tasks
getTasks(filters?)     editTask(id, partial)
addTask(task)          deleteTask(id)          // also deletes all child submissions

// Submissions
getSubmissions(filters?)  editSubmission(id, partial)
addSubmission(sub)        deleteSubmission(id)

// Users
getUsers(filters?)     editUser(id, partial)
addUser(user)          deleteUser(id)
```

> `deleteTask` cascades — it removes the task **and** all submissions with a matching `taskId` from localStorage in one operation.

---

## Authentication

Authentication is entirely client-side using `localStorage` sessions. The `AuthContext` provides:

```typescript
interface AuthContextType {
  user: User | null        // currently logged-in user
  users: User[]            // all users (used by admin features)
  login: (email, password) => Promise<void>
  logout: () => void
  isLoading: boolean       // true while users query loads or login is in flight
}
```

### Session lifecycle

1. On `AuthProvider` mount, `useUsers` fetches all users
2. Once users load, the `useEffect` reads `localStorage.session`, finds the matching user by `user_id`, and calls `setUser`
3. `login()` searches the users array for a matching email+password, writes a new session object, and sets the user in state
4. `logout()` removes the session and clears user state
5. If a stored session points to a user that no longer exists, the session is automatically cleared

### Session object shape

```typescript
interface Session {
  id: string        // crypto.randomUUID()
  user_id: string
  role: UserRole
  createdAt?: Date
}
```

---

## Role-Based Access

Every page follows this pattern — auth logic stays in the page, UI logic stays in the component:

```tsx
// app/feed/page.tsx
export default function FeedPage() {
  const { user } = useAuth()
  if (!user) return <Unauthenticated />
  return <TaskFeed user={user} />
}
```

The sidebar (`AppSidebar`) automatically renders the correct route set based on `user.role`:

- **`admin`** — Dashboard, Task Composer, Task Management, Submissions, User Management, Performance, Feed, Settings
- **`worker`** — Dashboard, Tasks (Feed), Performance, Settings

---

## Hooks Reference

All hooks follow the same pattern and are built on TanStack Query.

### `use-tasks.ts`

```typescript
useTasks(filters?)       // useQuery — fetches tasks, optionally filtered
useAddTask()             // useMutation — adds a task, invalidates ['tasks']
useEditTask()            // useMutation({ id, data }) — patches a task
useDeleteTask()          // useMutation(id) — deletes task + its submissions
```

### `use-submissions.ts`

```typescript
useSubmissions(filters?) // useQuery — fetches submissions, optionally filtered
useAddSubmission()       // useMutation(submission)
useEditSubmission()      // useMutation({ id, data }) — used for status review
useDeleteSubmission()    // useMutation(id)
```

### `use-users.ts`

```typescript
useUsers(filters?)       // useQuery
useAddUser()             // useMutation(user)
useEditUser()            // useMutation({ id, data }) — role, status, profilePicture
useDeleteUser()          // useMutation(id)
```

All mutations call `queryClient.invalidateQueries` on success, keeping the UI automatically in sync.

---

## Component Architecture

### Tables

Each entity has a dedicated folder under `components/`:

```
entity-table/
├── components/
│   ├── build-columns.tsx     # ColumnDef factory — receives onView and onDelete callbacks
│   └── entity-details.tsx    # Controlled Dialog — opened from index, not from inside the dropdown
└── index.tsx                 # Owns all state: sorting, filters, dialog open/selected row
```

**Why the dialog lives in `index.tsx`:** Putting a `Dialog` inside a `DropdownMenuItem` causes it to unmount immediately when the dropdown closes. The fix is to lift dialog state to the parent, pass an `onView` callback into `buildColumns`, and render the dialog at the top level.

### Filtering & Sorting

All filtering and sorting is handled entirely by TanStack Table — no manual `useEffect` or derived state arrays:

```typescript
// Set a filter
table.getColumn("status")?.setFilterValue("active")

// Clear a filter
table.getColumn("status")?.setFilterValue(undefined)

// Read current filter value for UI display
table.getColumn("status")?.getFilterValue() as string
```

### Task Feed submission guard

Before opening the submit dialog the feed checks two things:

1. `task.status === 'active'` (already filtered out of the list)
2. If `!task.allowMultipleSubmissions`, calls `getSubmissions([...])` synchronously from localStorage to check for an existing submission by the current user

On successful submission:
- `useAddSubmission` persists the new submission
- `useEditTask` increments `task.submissionsReceived`
- A `refreshKey` state variable is incremented to force `submittedTaskIds` (a `useMemo`) to recompute, immediately greying out the card

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
git clone <repo-url>
cd taskflow
npm install
```

### Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Seed data

On first load, `localStorage` is automatically populated with mock tasks, submissions, and users from `lib/mock-data.ts`. To reset to seed data, open DevTools and run:

```javascript
localStorage.clear()
location.reload()
```

### Default credentials

Check `MOCK_USERS` in `lib/mock-data.ts` for seeded email/password pairs. At least one user should have `role: 'admin'` and one `role: 'worker'`.

---

## Known Limitations

| Limitation | Notes |
|---|---|
| **No real backend** | All data lives in `localStorage` — data is per-browser and lost if storage is cleared |
| **Passwords stored in plaintext** | This is a mock — in production, never store raw passwords client-side |
| **No real auth** | Sessions are not validated server-side; any user can access any route by navigating directly |
| **Profile pictures are base64** | Stored inline in localStorage — large images will bloat storage quickly |
| **No pagination on localStorage reads** | All records are loaded into memory; not suitable for large datasets |
| **Single-tab only** | Changes in one tab won't reflect in another without a page refresh |