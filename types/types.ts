export type UserRole = 'admin' | 'worker'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  profilePicture: string
  createdAt: Date
  status: 'active' | 'inactive'
  password: string
}

export interface Sessions {
  id: string,
  user_id: string,
  createdAt: Date
}

export type TaskType = 'social_media_posting' | 'email_sending' | 'social_media_liking'

export interface Task {
  id: string
  type: TaskType
  title: string
  description?: string
  details: string
  amount: number
  reward: number
  allowMultipleSubmissions: boolean
  campaignId?: string
  status: 'active' | 'completed' | 'archived'
  createdAt: Date
  submissionsReceived: number
  // Phase 2 additions
  phases?: TaskPhase[]
  dripFeed?: DripFeed
}

export type SubmissionStatus = 'pending' | 'approved' | 'rejected'

export interface Submission {
  id: string
  taskId: string
  workerId: string
  status: SubmissionStatus
  phaseId?: string        // which phase this submission belongs to
  data: {
    postUrl?: string
    emailContent?: string
    evidenceScreenshot: string
  }
  submittedAt: Date
  reviewedAt?: Date
}

export interface AuthContextType {
  user: User | null
  users: User[]
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
}

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

// ── Drip Feed ─────────────────────────────────────────────────────────────────
export interface DripFeed {
  enabled: boolean
  dripAmount: number
  dripInterval: number   // minutes
  lastReleasedAt?: Date
  totalReleased: number
}
