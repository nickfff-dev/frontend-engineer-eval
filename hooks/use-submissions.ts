import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Submission } from '@/types/types';
import { getSubmissions, editSubmission, deleteSubmission, addSubmission } from '@/lib/mock-data';

type SubmissionFilter = { field: keyof Submission; value: any };

const fetchSubmissions = (filters: SubmissionFilter[] = []): Promise<Submission[]> =>
  new Promise((resolve) => setTimeout(() => resolve(getSubmissions(filters)), 1000));

const postSubmission = (submission: Submission) =>
  new Promise((resolve) => setTimeout(() => resolve(addSubmission(submission)), 2000));

const putSubmission = (id: string, data: Partial<Submission>) =>
  new Promise((resolve) => setTimeout(() => resolve(editSubmission(id, data)), 2000));

const delSubmission = (id: string): Promise<void> =>
  new Promise((resolve) => setTimeout(() => { deleteSubmission(id); resolve(); }, 1000));

// ── Hooks ──────────────────────────────────────────────────────────────────
const useSubmissions = (filters: SubmissionFilter[] = []) =>
  useQuery({
    queryKey: ['submissions', filters],
    queryFn: () => fetchSubmissions(filters),
  });

const useAddSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (submission: Submission) => postSubmission(submission),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions'] }),
  });
};

const useEditSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Submission> }) =>
      putSubmission(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions'] }),
  });
};

const useDeleteSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => delSubmission(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions'] }),
  });
};

export { useSubmissions, useAddSubmission, useEditSubmission, useDeleteSubmission };
export type { SubmissionFilter };