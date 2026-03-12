import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Task } from '@/types/types';
import { getTasks, editTask, deleteTask, addTask } from '@/lib/mock-data';

type TaskFilter = { field: keyof Task; value: any };

const fetchTasks = (filters: TaskFilter[] = []): Promise<Task[]> =>
  new Promise((resolve) => setTimeout(() => resolve(getTasks(filters)), 1000));

const postTask = (task: Task) =>
  new Promise((resolve) => setTimeout(() => resolve(addTask(task)), 2000));

const putTask = (id: string, data: Partial<Task>) =>
  new Promise((resolve) => setTimeout(() => resolve(editTask(id, data)), 2000));

const delTask = (id: string): Promise<void> =>
  new Promise((resolve) => setTimeout(() => { deleteTask(id); resolve(); }, 1000));

// ── Hooks ──────────────────────────────────────────────────────────────────

const useTasks = (filters: TaskFilter[] = []) =>
  useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => fetchTasks(filters),
  });

const useAddTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (task: Task) => postTask(task),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

const useEditTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      putTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => delTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export { useTasks, useAddTask, useEditTask, useDeleteTask };
export type { TaskFilter };