'use client';
import { useAuth } from '@/context/AuthContext';
import TaskFeed from '@/components/task-feed';
import { Unauthenticated } from '@/components/unauthenticated';


export default function TaskFeedPage() {
  const { user } = useAuth();
  if (!user) {
    return <Unauthenticated />
  }
  return (
    <TaskFeed user={user} />
  )

}