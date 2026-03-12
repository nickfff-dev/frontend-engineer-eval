import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types/types';
import { getUsers, editUser, deleteUser, addUser } from '@/lib/mock-data';

type UserFilter = { field: keyof User; value: any };

const fetchUsers = (filters: UserFilter[] = []): Promise<User[]> =>
  new Promise((resolve) => setTimeout(() => resolve(getUsers(filters)), 10));

const postUser = (user: User): Promise<User> =>
  new Promise((resolve) => setTimeout(() => resolve(addUser(user)), 2000));

const putUser = (id: string, data: Partial<User>): Promise<User> =>
  new Promise((resolve) => setTimeout(() => resolve(editUser(id, data)), 2000));

const delUser = (id: string): Promise<void> =>
  new Promise((resolve) => setTimeout(() => { deleteUser(id); resolve(); }, 1000));

// ── Hooks ──────────────────────────────────────────────────────────────────

const useUsers = (filters: UserFilter[] = []) =>
  useQuery({
    queryKey: ['users', filters],
    queryFn: () => fetchUsers(filters),
  });

const useAddUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (user: User) => postUser(user),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

const useEditUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => putUser(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

const useDeleteUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => delUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
};

export { useUsers, useAddUser, useEditUser, useDeleteUser };
export type { UserFilter };