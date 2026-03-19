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

// export const MOCK_TASKS: Task[] = [
//   {
//     id: 'task-1',
//     type: 'social_media_posting',
//     title: 'Share our latest blog post',
//     description: 'Share our new tech article on social media',
//     details: 'Post the link to our latest blog article on your social media profiles.',
//     amount: 100,
//     reward: 50,
//     allowMultipleSubmissions: true,
//     campaignId: 'camp-001',
//     status: 'active',
//     createdAt: new Date('2024-03-01'),
//     submissionsReceived: 2,
//   },
//   {
//     id: 'task-2',
//     type: 'email_sending',
//     title: 'Send product feedback email',
//     description: 'Request product feedback from users',
//     details: 'Send an email to 5 contacts requesting their feedback on our latest features.',
//     amount: 50,
//     reward: 25,
//     allowMultipleSubmissions: false,
//     campaignId: 'camp-001',
//     status: 'active',
//     createdAt: new Date('2024-03-02'),
//     submissionsReceived: 1,
//   },
//   {
//     id: 'task-3',
//     type: 'social_media_liking',
//     title: 'Like and comment on Instagram post',
//     description: 'Engage with our Instagram content',
//     details: 'Like and comment on our latest Instagram post with a meaningful comment.',
//     amount: 25,
//     reward: 5,
//     allowMultipleSubmissions: true,
//     campaignId: 'camp-002',
//     status: 'active',
//     createdAt: new Date('2024-03-03'),
//     submissionsReceived: 1,
//   },
//   {
//     id: 'task-4',
//     type: 'social_media_posting',
//     title: 'Tweet about new product launch',
//     description: 'Promote product launch on Twitter',
//     details: 'Tweet about our new product launch with the hashtag #ProductLaunch2024',
//     amount: 150,
//     reward: 75,
//     allowMultipleSubmissions: false,
//     campaignId: 'camp-002',
//     status: 'active',
//     createdAt: new Date('2024-03-04'),
//     submissionsReceived: 1,
//   },
//   {
//     id: 'task-5',
//     type: 'email_sending',
//     title: 'Newsletter signup confirmation',
//     description: 'Send confirmation email to new subscribers',
//     details: 'Send a welcome email to 3 new newsletter subscribers.',
//     amount: 40,
//     reward: 20,
//     allowMultipleSubmissions: false,
//     campaignId: 'camp-003',
//     status: 'active',
//     createdAt: new Date('2024-03-05'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-6',
//     type: 'social_media_liking',
//     title: 'Like TikTok videos with trending sound',
//     description: 'Engage with trending TikTok content',
//     details: 'Like 5 TikTok videos using the trending sound from our brand.',
//     amount: 30,
//     reward: 10,
//     allowMultipleSubmissions: true,
//     campaignId: 'camp-002',
//     status: 'active',
//     createdAt: new Date('2024-03-06'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-7',
//     type: 'social_media_posting',
//     title: 'Create LinkedIn article',
//     description: 'Write and share LinkedIn article about industry insights',
//     details: 'Write a LinkedIn article (500+ words) about industry trends and share it.',
//     amount: 250,
//     reward: 125,
//     allowMultipleSubmissions: false,
//     campaignId: 'camp-003',
//     status: 'active',
//     createdAt: new Date('2024-03-07'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-8',
//     type: 'email_sending',
//     title: 'Send referral invitation emails',
//     description: 'Invite friends to join our platform',
//     details: 'Send referral invitations to 5 friends via email.',
//     amount: 75,
//     reward: 15,
//     allowMultipleSubmissions: true,
//     campaignId: 'camp-001',
//     status: 'active',
//     createdAt: new Date('2024-03-08'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-9',
//     type: 'social_media_liking',
//     title: 'React to Facebook posts',
//     description: 'Engage with our Facebook community',
//     details: 'React to (like, love, or comment) 3 of our Facebook posts.',
//     amount: 20,
//     reward: 5,
//     allowMultipleSubmissions: true,
//     campaignId: 'camp-001',
//     status: 'active',
//     createdAt: new Date('2024-03-09'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-10',
//     type: 'social_media_posting',
//     title: 'YouTube video review',
//     description: 'Record and share a YouTube video review',
//     details: 'Record a 2-3 minute video review of our product and upload it to YouTube.',
//     amount: 300,
//     reward: 150,
//     allowMultipleSubmissions: false,
//     campaignId: 'camp-003',
//     status: 'completed',
//     createdAt: new Date('2024-02-28'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-11',
//     type: 'email_sending',
//     title: 'Corporate email outreach',
//     description: 'Send cold emails to potential partners',
//     details: 'Send personalized cold emails to 10 potential corporate partners.',
//     amount: 200,
//     reward: 100,
//     allowMultipleSubmissions: false,
//     campaignId: 'camp-002',
//     status: 'active',
//     createdAt: new Date('2024-03-02'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-12',
//     type: 'social_media_liking',
//     title: 'Pinterest board pins',
//     description: 'Pin content to Pinterest boards',
//     details: 'Pin 5 relevant articles to our Pinterest boards.',
//     amount: 40,
//     reward: 20,
//     allowMultipleSubmissions: true,
//     campaignId: 'camp-001',
//     status: 'active',
//     createdAt: new Date('2024-03-08'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-13',
//     type: 'social_media_posting',
//     title: 'Instagram Stories campaign',
//     description: 'Create Instagram Stories with our product',
//     details: 'Create 3-5 Instagram Stories featuring our product with creative filters.',
//     amount: 120,
//     reward: 60,
//     allowMultipleSubmissions: false,
//     campaignId: 'camp-002',
//     status: 'active',
//     createdAt: new Date('2024-03-06'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-14',
//     type: 'email_sending',
//     title: 'Event invitation emails',
//     description: 'Send invitations to our upcoming webinar',
//     details: 'Send webinar invitation emails to 15 interested prospects.',
//     amount: 90,
//     reward: 45,
//     allowMultipleSubmissions: false,
//     campaignId: 'camp-003',
//     status: 'active',
//     createdAt: new Date('2024-03-07'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-15',
//     type: 'social_media_liking',
//     title: 'Twitter engagement boost',
//     description: 'Like and retweet our tweets',
//     details: 'Like and retweet 5 of our recent tweets to boost engagement.',
//     amount: 25,
//     reward: 5,
//     allowMultipleSubmissions: true,
//     campaignId: 'camp-002',
//     status: 'active',
//     createdAt: new Date('2024-03-05'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-16',
//     type: 'social_media_posting',
//     title: 'Substack newsletter post',
//     description: 'Write and publish newsletter article',
//     details: 'Write a 1000+ word Substack article about your experience with our product.',
//     amount: 180,
//     reward: 90,
//     allowMultipleSubmissions: false,
//     campaignId: 'camp-001',
//     status: 'active',
//     createdAt: new Date('2024-03-04'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-17',
//     type: 'email_sending',
//     title: 'Birthday promotion emails',
//     description: 'Send birthday discount offers',
//     details: 'Send birthday discount code emails to 8 customers.',
//     amount: 60,
//     reward: 30,
//     allowMultipleSubmissions: true,
//     campaignId: 'camp-001',
//     status: 'active',
//     createdAt: new Date('2024-03-07'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-18',
//     type: 'social_media_liking',
//     title: 'YouTube comment engagement',
//     description: 'Leave thoughtful comments on YouTube videos',
//     details: 'Leave 3 thoughtful comments on 3 different relevant YouTube videos.',
//     amount: 40,
//     reward: 20,
//     allowMultipleSubmissions: true,
//     campaignId: 'camp-003',
//     status: 'active',
//     createdAt: new Date('2024-03-08'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-19',
//     type: 'social_media_posting',
//     title: 'Snapchat promotional content',
//     description: 'Create Snapchat promotional videos',
//     details: 'Create 3 Snapchat videos promoting our new feature.',
//     amount: 110,
//     reward: 55,
//     allowMultipleSubmissions: true,
//     campaignId: 'camp-002',
//     status: 'active',
//     createdAt: new Date('2024-03-06'),
//     submissionsReceived: 0,
//   },
//   {
//     id: 'task-20',
//     type: 'email_sending',
//     title: 'Survey feedback collection',
//     description: 'Send customer satisfaction surveys',
//     details: 'Send customer satisfaction surveys to 12 recent customers.',
//     amount: 70,
//     reward: 35,
//     allowMultipleSubmissions: false,
//     campaignId: 'camp-002',
//     status: 'active',
//     createdAt: new Date('2024-03-09'),
//     submissionsReceived: 0,
//   },
// ]

// export const MOCK_SUBMISSIONS: Submission[] = [
//   {
//     id: 'sub-1',
//     taskId: 'task-1',
//     workerId: '2',
//     status: 'approved',
//     data: {
//       postUrl: 'https://twitter.com/user/status/123456',
//       evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
//     },
//     submittedAt: new Date('2024-03-09'),
//     reviewedAt: new Date('2024-03-09'),
//   },
//   {
//     id: 'sub-2',
//     taskId: 'task-1',
//     workerId: '3',
//     status: 'pending',
//     data: {
//       postUrl: 'https://twitter.com/user/status/654321',
//       evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
//     },
//     submittedAt: new Date('2024-03-10'),
//   },
//   {
//     id: 'sub-3',
//     taskId: 'task-3',
//     workerId: '4',
//     status: 'approved',
//     data: {
//       postUrl: 'https://instagram.com/p/ABC123',
//       evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
//     },
//     submittedAt: new Date('2024-03-08'),
//     reviewedAt: new Date('2024-03-08'),
//   },
//   {
//     id: 'sub-4',
//     taskId: 'task-2',
//     workerId: '5',
//     status: 'rejected',
//     data: {
//       emailContent: 'Hi, can you share your feedback on our product?',
//       evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
//     },
//     submittedAt: new Date('2024-03-07'),
//     reviewedAt: new Date('2024-03-08'),
//   },
//   {
//     id: 'sub-5',
//     taskId: 'task-4',
//     workerId: '7',
//     status: 'pending',
//     data: {
//       postUrl: 'https://twitter.com/user/status/789012',
//       evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
//     },
//     submittedAt: new Date('2024-03-09'),
//   },
// ]
export const MOCK_TASKS: Task[] = [
  // ── Standard tasks (no phases, no drip) ──────────────────────────────────
  {
    id: 'task-1',
    type: 'social_media_posting',
    title: 'Share our latest blog post',
    description: 'Share our new tech article on social media',
    details: 'Post the link to our latest blog article on your social media profiles. Include the hashtag #TechInsights2024.',
    amount: 100,   // 10 slots × $10
    reward: 10,
    allowMultipleSubmissions: true,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-01'),
    submissionsReceived: 2,
  },
  {
    id: 'task-2',
    type: 'email_sending',
    title: 'Send product feedback email',
    description: 'Request product feedback from users',
    details: 'Send an email to 5 contacts requesting their feedback on our latest features. Use the provided template.',
    amount: 150,   // 6 slots × $25
    reward: 25,
    allowMultipleSubmissions: false,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-02'),
    submissionsReceived: 1,
  },
  {
    id: 'task-3',
    type: 'social_media_liking',
    title: 'Like and comment on Instagram post',
    description: 'Engage with our Instagram content',
    details: 'Like and leave a meaningful comment (min 10 words) on our latest Instagram post.',
    amount: 50,    // 10 slots × $5
    reward: 5,
    allowMultipleSubmissions: false,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-03'),
    submissionsReceived: 1,
  },
  {
    id: 'task-4',
    type: 'social_media_posting',
    title: 'Tweet about new product launch',
    description: 'Promote product launch on Twitter/X',
    details: 'Tweet about our new product launch with the hashtag #ProductLaunch2024. Min 50 characters.',
    amount: 300,   // 4 slots × $75
    reward: 75,
    allowMultipleSubmissions: false,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-04'),
    submissionsReceived: 1,
  },
  {
    id: 'task-5',
    type: 'email_sending',
    title: 'Newsletter signup confirmation',
    description: 'Send confirmation email to new subscribers',
    details: 'Send a welcome email to 3 new newsletter subscribers using the provided template.',
    amount: 120,   // 6 slots × $20
    reward: 20,
    allowMultipleSubmissions: false,
    campaignId: 'camp-003',
    status: 'active',
    createdAt: new Date('2024-03-05'),
    submissionsReceived: 0,
  },

  // ── Drip feed task ────────────────────────────────────────────────────────
  {
    id: 'task-6',
    type: 'social_media_posting',
    title: 'Reddit community posts — daily drip',
    description: 'Post in relevant Reddit communities. Released in daily batches.',
    details: 'Post a genuine, non-promotional discussion in a relevant subreddit. Must receive at least 5 upvotes. Screenshot required.',
    amount: 500,   // 50 slots × $10
    reward: 10,
    allowMultipleSubmissions: true,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-06'),
    submissionsReceived: 8,
    dripFeed: {
      enabled: true,
      dripAmount: 10,
      dripInterval: 1440, // 24 hours
      totalReleased: 20,
      lastReleasedAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
  },

  // ── Phased task — content campaign ───────────────────────────────────────
  {
    id: 'task-7',
    type: 'social_media_posting',
    title: 'Product launch content campaign',
    description: 'A 3-phase campaign — post, engage, and report.',
    details: 'Full campaign supporting our Q2 product launch across social platforms.',
    amount: 1800,  // sum of phase rewards × slots: (20×$30) + (50×$15) + (10×$45)
    reward: 30,    // base reward (phase 1 reward shown on card)
    allowMultipleSubmissions: false,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-07'),
    submissionsReceived: 34,
    phases: [
      {
        id: 'phase-7-1',
        phaseIndex: 1,
        phaseName: 'Launch Posts',
        slots: 20,
        instructions: 'Post about the product launch on your primary social media account. Include #Q2Launch and a screenshot of your post.',
        reward: 30,
        submissionsReceived: 20,
        status: 'completed',
      },
      {
        id: 'phase-7-2',
        phaseIndex: 2,
        phaseName: 'Comment Replies',
        slots: 50,
        instructions: 'Reply to comments on any of the Phase 1 posts. Each reply must be at least 15 words and constructive. Submit a screenshot.',
        reward: 15,
        submissionsReceived: 14,
        status: 'active',
      },
      {
        id: 'phase-7-3',
        phaseIndex: 3,
        phaseName: 'Engagement Reports',
        slots: 10,
        instructions: 'Compile an engagement report showing likes, comments, and reach from your Phase 1 post. Submit as a screenshot or PDF export.',
        reward: 45,
        submissionsReceived: 0,
        status: 'pending',
      },
    ],
  },

  // ── Phased + drip task ────────────────────────────────────────────────────
  {
    id: 'task-8',
    type: 'email_sending',
    title: 'Email outreach campaign — phased & drip',
    description: 'Cold outreach campaign released in hourly batches across 2 phases.',
    details: 'Reach out to potential partners via email. Follow the provided scripts for each phase.',
    amount: 900,   // phase 1: 30×$20 = 600, phase 2: 15×$20 = 300
    reward: 20,
    allowMultipleSubmissions: false,
    campaignId: 'camp-003',
    status: 'active',
    createdAt: new Date('2024-03-08'),
    submissionsReceived: 12,
    phases: [
      {
        id: 'phase-8-1',
        phaseIndex: 1,
        phaseName: 'Initial Outreach',
        slots: 30,
        instructions: 'Send the initial cold email using Script A to prospects from the provided list. Screenshot your sent folder.',
        reward: 20,
        submissionsReceived: 12,
        status: 'active',
      },
      {
        id: 'phase-8-2',
        phaseIndex: 2,
        phaseName: 'Follow-up Emails',
        slots: 15,
        instructions: 'Send a follow-up email (Script B) to contacts who did not respond from Phase 1. Screenshot required.',
        reward: 20,
        submissionsReceived: 0,
        status: 'pending',
      },
    ],
    dripFeed: {
      enabled: true,
      dripAmount: 5,
      dripInterval: 360, // every 6 hours
      totalReleased: 15,
      lastReleasedAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago — almost ready
    },
  },

  // ── More standard tasks ───────────────────────────────────────────────────
  {
    id: 'task-9',
    type: 'social_media_liking',
    title: 'React to Facebook posts',
    description: 'Engage with our Facebook community',
    details: 'React to (like, love, or comment) 3 of our Facebook posts. Screenshots of each reaction required.',
    amount: 100,   // 20 slots × $5
    reward: 5,
    allowMultipleSubmissions: false,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-09'),
    submissionsReceived: 0,
  },
  {
    id: 'task-10',
    type: 'social_media_posting',
    title: 'YouTube video review',
    description: 'Record and share a YouTube video review',
    details: 'Record a 2-3 minute honest video review of our product and upload it to YouTube. Link required.',
    amount: 300,   // 2 slots × $150
    reward: 150,
    allowMultipleSubmissions: false,
    campaignId: 'camp-003',
    status: 'completed',
    createdAt: new Date('2024-02-28'),
    submissionsReceived: 2,
  },
  {
    id: 'task-11',
    type: 'social_media_liking',
    title: 'Twitter engagement boost',
    description: 'Like and retweet our tweets',
    details: 'Like and retweet 5 of our recent tweets. Screenshot your activity feed as evidence.',
    amount: 150,   // 30 slots × $5
    reward: 5,
    allowMultipleSubmissions: true,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-05'),
    submissionsReceived: 0,
  },
  {
    id: 'task-12',
    type: 'email_sending',
    title: 'Referral invitation emails',
    description: 'Invite friends to join our platform',
    details: 'Send our referral invitation email to at least 5 contacts. Use the provided template and screenshot your sent items.',
    amount: 300,   // 20 slots × $15
    reward: 15,
    allowMultipleSubmissions: false,
    campaignId: 'camp-001',
    status: 'active',
    createdAt: new Date('2024-03-08'),
    submissionsReceived: 0,
  },
  {
    id: 'task-13',
    type: 'social_media_posting',
    title: 'Instagram Stories campaign',
    description: 'Create Instagram Stories featuring our product',
    details: 'Create 3-5 Instagram Stories featuring our product with creative filters and a swipe-up link. Record a screen capture.',
    amount: 240,   // 4 slots × $60
    reward: 60,
    allowMultipleSubmissions: false,
    campaignId: 'camp-002',
    status: 'active',
    createdAt: new Date('2024-03-06'),
    submissionsReceived: 0,
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
      evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
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
      evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
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
      evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
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
      evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
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
      evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
    },
    submittedAt: new Date('2024-03-09'),
  },
  // Phase submissions for task-7
  {
    id: 'sub-6',
    taskId: 'task-7',
    workerId: '2',
    status: 'approved',
    phaseId: 'phase-7-1',
    data: {
      postUrl: 'https://instagram.com/p/launch001',
      evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
    },
    submittedAt: new Date('2024-03-10'),
    reviewedAt: new Date('2024-03-11'),
  },
  {
    id: 'sub-7',
    taskId: 'task-7',
    workerId: '2',
    status: 'pending',
    phaseId: 'phase-7-2',
    data: {
      postUrl: 'https://instagram.com/p/reply001',
      evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
    },
    submittedAt: new Date('2024-03-12'),
  },
  // Drip task submission
  {
    id: 'sub-8',
    taskId: 'task-6',
    workerId: '3',
    status: 'approved',
    data: {
      postUrl: 'https://reddit.com/r/tech/comments/abc123',
      evidenceScreenshot: 'https://images.unsplash.com/photo-1516383274235-5f42d6c6426d?q=80&w=2074&auto=format&fit=crop',
    },
    submittedAt: new Date('2024-03-11'),
    reviewedAt: new Date('2024-03-12'),
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
  const stored = localStorage.getItem('tasks_b');
  if (!stored) localStorage.setItem('tasks_b', JSON.stringify(MOCK_TASKS))
  const data: Task[] = stored ? JSON.parse(stored) : MOCK_TASKS

  if (!filters.length) return data
  return data.filter((t) => filters.every(({ field, value }) => t[field] === value))
}

export function getSubmissions(filters: Filter<Submission>[] = []): Submission[] {
  const stored = localStorage.getItem('submissions_b')
  if (!stored) localStorage.setItem('submissions_b', JSON.stringify(MOCK_SUBMISSIONS))
  const data: Submission[] = stored ? JSON.parse(stored) : MOCK_SUBMISSIONS

  if (!filters.length) return data
  return data.filter((s) => filters.every(({ field, value }) => s[field] === value))
}



export function addTask(task: Task) {
  const tasks = getTasks();
  localStorage.setItem('tasks_b', JSON.stringify([...tasks, task]))
}

export function addSubmission(submission: Submission) {
  const submissions = getSubmissions();
  localStorage.setItem('submissions_b', JSON.stringify([...submissions, submission]))
}

export function editTask(id: string, task_data: Partial<Task>) {
  const tasks = getTasks();
  const updated = tasks.map((t) => t.id === id ? { ...t, ...task_data } : t);
  localStorage.setItem('tasks_b', JSON.stringify(updated));
  return updated.find((t) => t.id === id)!;
}

export function editSubmission(id: string, submission_data: Partial<Submission>) {
  const submissions = getSubmissions();
  const updated = submissions.map((s) => s.id === id ? { ...s, ...submission_data } : s);
  localStorage.setItem('submissions_b', JSON.stringify(updated));
  return updated.find((s) => s.id === id)!;
}

export function deleteTask(id: string) {
  const tasks = getTasks();
  const submissions = getSubmissions();
  localStorage.setItem('submissions_b', JSON.stringify(submissions.filter((s) => s.taskId !== id)));
  localStorage.setItem('tasks_b', JSON.stringify([...(tasks.filter(task => task.id !== id))]))
}

export function deleteSubmission(id: string) {
  const submissions = getSubmissions();
  localStorage.setItem('submissions_b', JSON.stringify([...(submissions.filter(submission => submission.id !== id))]))
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

  localStorage.setItem('submissions_b', JSON.stringify(submissions.filter((u) => u.workerId !== id)))
  localStorage.setItem('users', JSON.stringify(data.filter((u) => u.id !== id)))
}

export function getTaskSlots(task: Task): {
  maxSlots: number
  slotsRemaining: number
  isFull: boolean
} {
  const maxSlots = task.reward > 0 ? Math.floor(task.amount / task.reward) : 0
  const slotsRemaining = Math.max(0, maxSlots - task.submissionsReceived)
  return {
    maxSlots,
    slotsRemaining,
    isFull: slotsRemaining === 0,
  }
}