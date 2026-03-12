import type { User, Task, Submission } from '../types/types'
type Filter<T> = { field: keyof T; value: any };

export const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    createdAt: new Date('2024-01-15'),
    status: 'active',
    password: 'password',
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'worker',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
    createdAt: new Date('2024-02-01'),
    status: 'active',
    password: 'password2',
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    role: 'worker',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
    createdAt: new Date('2024-02-05'),
    status: 'active',
    password: 'password3',
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma@example.com',
    role: 'worker',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
    createdAt: new Date('2024-02-10'),
    status: 'active',
    password: 'password4',
  },
  {
    id: '5',
    name: 'James Wilson',
    email: 'james@example.com',
    role: 'worker',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james',
    createdAt: new Date('2024-02-15'),
    status: 'active',
    password: 'password5',
  },
  {
    id: '6',
    name: 'Lisa Anderson',
    email: 'lisa@example.com',
    role: 'worker',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
    createdAt: new Date('2024-02-20'),
    status: 'inactive',
    password: 'password6',
  },
  {
    id: '7',
    name: 'Robert Martinez',
    email: 'robert@example.com',
    role: 'worker',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=robert',
    createdAt: new Date('2024-02-25'),
    status: 'active',
    password: 'password7',
  },
  {
    id: '8',
    name: 'Jennifer Lee',
    email: 'jennifer@example.com',
    role: 'worker',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer',
    createdAt: new Date('2024-03-01'),
    status: 'active',
    password: 'password8',
  },
  {
    id: '9',
    name: 'David Taylor',
    email: 'david@example.com',
    role: 'worker',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
    createdAt: new Date('2024-03-05'),
    status: 'active',
    password: 'password9',
  },
  {
    id: '10',
    name: 'Nicole Brown',
    email: 'nicole@example.com',
    role: 'worker',
    profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nicole',
    createdAt: new Date('2024-03-08'),
    status: 'active',
    password: 'password10',
  },
]

export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    type: 'social_media_posting',
    title: 'Share our latest blog post',
    description: 'Share our new tech article on social media',
    details: 'Post the link to our latest blog article on your social media profiles.',
    amount: 100,
    reward: 50,
    allowMultipleSubmissions: true,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-01'),
    submissionsReceived: 8,
  },
  {
    id: 'task-2',
    type: 'email_sending',
    title: 'Send product feedback email',
    description: 'Request product feedback from users',
    details: 'Send an email to 5 contacts requesting their feedback on our latest features.',
    amount: 50,
    reward: 25,
    allowMultipleSubmissions: false,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-02'),
    submissionsReceived: 3,
  },
  {
    id: 'task-3',
    type: 'social_media_liking',
    title: 'Like and comment on Instagram post',
    description: 'Engage with our Instagram content',
    details: 'Like and comment on our latest Instagram post with a meaningful comment.',
    amount: 25,
    reward: 15,
    allowMultipleSubmissions: true,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-03'),
    submissionsReceived: 12,
  },
  {
    id: 'task-4',
    type: 'social_media_posting',
    title: 'Tweet about new product launch',
    description: 'Promote product launch on Twitter',
    details: 'Tweet about our new product launch with the hashtag #ProductLaunch2024',
    amount: 150,
    reward: 75,
    allowMultipleSubmissions: false,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-04'),
    submissionsReceived: 5,
  },
  {
    id: 'task-5',
    type: 'email_sending',
    title: 'Newsletter signup confirmation',
    description: 'Send confirmation email to new subscribers',
    details: 'Send a welcome email to 3 new newsletter subscribers.',
    amount: 40,
    reward: 20,
    allowMultipleSubmissions: false,
    campaignId: 'camp-003',
    status: 'active',
    createdAt: new Date('2024-03-05'),
    submissionsReceived: 2,
  },
  {
    id: 'task-6',
    type: 'social_media_liking',
    title: 'Like TikTok videos with trending sound',
    description: 'Engage with trending TikTok content',
    details: 'Like 5 TikTok videos using the trending sound from our brand.',
    amount: 30,
    reward: 18,
    allowMultipleSubmissions: true,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-06'),
    submissionsReceived: 7,
  },
  {
    id: 'task-7',
    type: 'social_media_posting',
    title: 'Create LinkedIn article',
    description: 'Write and share LinkedIn article about industry insights',
    details: 'Write a LinkedIn article (500+ words) about industry trends and share it.',
    amount: 250,
    reward: 125,
    allowMultipleSubmissions: false,
    campaignId: 'camp-003',
    status: 'active',
    createdAt: new Date('2024-03-07'),
    submissionsReceived: 2,
  },
  {
    id: 'task-8',
    type: 'email_sending',
    title: 'Send referral invitation emails',
    description: 'Invite friends to join our platform',
    details: 'Send referral invitations to 5 friends via email.',
    amount: 75,
    reward: 40,
    allowMultipleSubmissions: true,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-08'),
    submissionsReceived: 4,
  },
  {
    id: 'task-9',
    type: 'social_media_liking',
    title: 'React to Facebook posts',
    description: 'Engage with our Facebook community',
    details: 'React to (like, love, or comment) 3 of our Facebook posts.',
    amount: 20,
    reward: 12,
    allowMultipleSubmissions: true,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-09'),
    submissionsReceived: 9,
  },
  {
    id: 'task-10',
    type: 'social_media_posting',
    title: 'YouTube video review',
    description: 'Record and share a YouTube video review',
    details: 'Record a 2-3 minute video review of our product and upload it to YouTube.',
    amount: 300,
    reward: 150,
    allowMultipleSubmissions: false,
    campaignId: 'camp-003',
    status: 'completed',
    createdAt: new Date('2024-02-28'),
    submissionsReceived: 1,
  },
  {
    id: 'task-11',
    type: 'email_sending',
    title: 'Corporate email outreach',
    description: 'Send cold emails to potential partners',
    details: 'Send personalized cold emails to 10 potential corporate partners.',
    amount: 200,
    reward: 100,
    allowMultipleSubmissions: false,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-02'),
    submissionsReceived: 1,
  },
  {
    id: 'task-12',
    type: 'social_media_liking',
    title: 'Pinterest board pins',
    description: 'Pin content to Pinterest boards',
    details: 'Pin 5 relevant articles to our Pinterest boards.',
    amount: 35,
    reward: 20,
    allowMultipleSubmissions: true,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-08'),
    submissionsReceived: 3,
  },
  {
    id: 'task-13',
    type: 'social_media_posting',
    title: 'Instagram Stories campaign',
    description: 'Create Instagram Stories with our product',
    details: 'Create 3-5 Instagram Stories featuring our product with creative filters.',
    amount: 120,
    reward: 60,
    allowMultipleSubmissions: false,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-06'),
    submissionsReceived: 2,
  },
  {
    id: 'task-14',
    type: 'email_sending',
    title: 'Event invitation emails',
    description: 'Send invitations to our upcoming webinar',
    details: 'Send webinar invitation emails to 15 interested prospects.',
    amount: 90,
    reward: 45,
    allowMultipleSubmissions: false,
    campaignId: 'camp-003',
    status: 'active',
    createdAt: new Date('2024-03-07'),
    submissionsReceived: 1,
  },
  {
    id: 'task-15',
    type: 'social_media_liking',
    title: 'Twitter engagement boost',
    description: 'Like and retweet our tweets',
    details: 'Like and retweet 5 of our recent tweets to boost engagement.',
    amount: 25,
    reward: 15,
    allowMultipleSubmissions: true,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-05'),
    submissionsReceived: 6,
  },
  {
    id: 'task-16',
    type: 'social_media_posting',
    title: 'Substack newsletter post',
    description: 'Write and publish newsletter article',
    details: 'Write a 1000+ word Substack article about your experience with our product.',
    amount: 180,
    reward: 90,
    allowMultipleSubmissions: false,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-04'),
    submissionsReceived: 1,
  },
  {
    id: 'task-17',
    type: 'email_sending',
    title: 'Birthday promotion emails',
    description: 'Send birthday discount offers',
    details: 'Send birthday discount code emails to 8 customers.',
    amount: 60,
    reward: 30,
    allowMultipleSubmissions: true,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-07'),
    submissionsReceived: 2,
  },
  {
    id: 'task-18',
    type: 'social_media_liking',
    title: 'YouTube comment engagement',
    description: 'Leave thoughtful comments on YouTube videos',
    details: 'Leave 3 thoughtful comments on 3 different relevant YouTube videos.',
    amount: 40,
    reward: 25,
    allowMultipleSubmissions: true,
    campaignId: 'camp-003',
    status: 'active',
    createdAt: new Date('2024-03-08'),
    submissionsReceived: 4,
  },
  {
    id: 'task-19',
    type: 'social_media_posting',
    title: 'Snapchat promotional content',
    description: 'Create Snapchat promotional videos',
    details: 'Create 3 Snapchat videos promoting our new feature.',
    amount: 110,
    reward: 55,
    allowMultipleSubmissions: true,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-06'),
    submissionsReceived: 1,
  },
  {
    id: 'task-20',
    type: 'email_sending',
    title: 'Survey feedback collection',
    description: 'Send customer satisfaction surveys',
    details: 'Send customer satisfaction surveys to 12 recent customers.',
    amount: 70,
    reward: 35,
    allowMultipleSubmissions: false,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-09'),
    submissionsReceived: 5,
  },
]

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    taskId: 'task-1',
    workerId: '2',
    status: 'approved',
    data: {
      postUrl: 'https://twitter.com/user/status/123456',
      evidenceScreenshot: 'https://via.placeholder.com/400x300?text=Screenshot',
    },
    submittedAt: new Date('2024-03-09'),
    reviewedAt: new Date('2024-03-09'),
  },
  {
    id: 'sub-2',
    taskId: 'task-1',
    workerId: '3',
    status: 'pending',
    data: {
      postUrl: 'https://twitter.com/user/status/654321',
      evidenceScreenshot: 'https://via.placeholder.com/400x300?text=Screenshot',
    },
    submittedAt: new Date('2024-03-10'),
  },
  {
    id: 'sub-3',
    taskId: 'task-3',
    workerId: '4',
    status: 'approved',
    data: {
      postUrl: 'https://instagram.com/p/ABC123',
      evidenceScreenshot: 'https://via.placeholder.com/400x300?text=Screenshot',
    },
    submittedAt: new Date('2024-03-08'),
    reviewedAt: new Date('2024-03-08'),
  },
  {
    id: 'sub-4',
    taskId: 'task-2',
    workerId: '5',
    status: 'rejected',
    data: {
      emailContent: 'Hi, can you share your feedback on our product?',
      evidenceScreenshot: 'https://via.placeholder.com/400x300?text=Screenshot',
    },
    submittedAt: new Date('2024-03-07'),
    reviewedAt: new Date('2024-03-08'),
  },
  {
    id: 'sub-5',
    taskId: 'task-4',
    workerId: '7',
    status: 'pending',
    data: {
      postUrl: 'https://twitter.com/user/status/789012',
      evidenceScreenshot: 'https://via.placeholder.com/400x300?text=Screenshot',
    },
    submittedAt: new Date('2024-03-09'),
  },
]

export function getTaskTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    social_media_posting: 'Social Media Posting',
    email_sending: 'Email Sending',
    social_media_liking: 'Social Media Liking',
  }
  return labels[type] || type
}

export function getSubmissionStatusBadgeColor(
  status: string
): 'default' | 'secondary' | 'outline' | 'destructive' {
  const colors: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
    approved: 'default',
    rejected: 'destructive',
    pending: 'secondary',
    active: 'default',
    completed: 'secondary',
    archived: 'outline',
  }
  return colors[status] || 'default'
}


export function getTasks(filters: Filter<Task>[] = []): Task[] {
  const stored = localStorage.getItem('tasks');
  if (!stored) localStorage.setItem('tasks', JSON.stringify(MOCK_TASKS))
  const data: Task[] = stored ? JSON.parse(stored) : MOCK_TASKS

  if (!filters.length) return data
  return data.filter((t) => filters.every(({ field, value }) => t[field] === value))
}

export function getSubmissions(filters: Filter<Submission>[] = []): Submission[] {
  const stored = localStorage.getItem('submissions')
  if (!stored) localStorage.setItem('submissions', JSON.stringify(MOCK_SUBMISSIONS))
  const data: Submission[] = stored ? JSON.parse(stored) : MOCK_SUBMISSIONS

  if (!filters.length) return data
  return data.filter((s) => filters.every(({ field, value }) => s[field] === value))
}



export function addTask(task: Task) {
  const tasks = getTasks();
  localStorage.setItem('tasks', JSON.stringify([...tasks, task]))
}

export function addSubmission(submission: Submission) {
  const submissions = getSubmissions();
  localStorage.setItem('submissions', JSON.stringify([...submissions, submission]))
}

export function editTask(id: string, task_data: Partial<Task>) {
  const tasks = getTasks();
  const updated = tasks.map((t) => t.id === id ? { ...t, ...task_data } : t);
  localStorage.setItem('tasks', JSON.stringify(updated));
  return updated.find((t) => t.id === id)!;
}

export function editSubmission(id: string, submission_data: Partial<Submission>) {
  const submissions = getSubmissions();
  const updated = submissions.map((s) => s.id === id ? { ...s, ...submission_data } : s);
  localStorage.setItem('submissions', JSON.stringify(updated));
  return updated.find((s) => s.id === id)!;
}

export function deleteTask(id: string) {
  const tasks = getTasks();
  const submissions = getSubmissions();
  localStorage.setItem('submissions', JSON.stringify(submissions.filter((s) => s.taskId !== id)));
  localStorage.setItem('tasks', JSON.stringify([...(tasks.filter(task => task.id !== id))]))
}

export function deleteSubmission(id: string) {
  const submissions = getSubmissions();
  localStorage.setItem('submissions', JSON.stringify([...(submissions.filter(submission => submission.id !== id))]))
}

export function getUsers(filters: Filter<User>[] = []): User[] {
  const stored = localStorage.getItem('users')
  if (!stored) localStorage.setItem('users', JSON.stringify(MOCK_USERS))
  const data: User[] = stored ? JSON.parse(stored) : MOCK_USERS

  if (!filters.length) return data
  return data.filter((u) => filters.every(({ field, value }) => u[field] === value))
}

export function addUser(user: User): User {
  const data = getUsers()
  const updated = [...data, user]
  localStorage.setItem('users', JSON.stringify(updated))
  return user
}

export function editUser(id: string, updates: Partial<User>): User {
  const data = getUsers()
  const updated = data.map((u) => (u.id === id ? { ...u, ...updates } : u))
  localStorage.setItem('users', JSON.stringify(updated))
  return updated.find((u) => u.id === id)!
}

export function deleteUser(id: string): void {
  const data = getUsers();
  const submissions = getSubmissions();

  localStorage.setItem('submissions', JSON.stringify(submissions.filter((u) => u.workerId !== id)))
  localStorage.setItem('users', JSON.stringify(data.filter((u) => u.id !== id)))
}