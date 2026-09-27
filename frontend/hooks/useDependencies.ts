'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Task } from '@/types';

// ============================================
// Types
// ============================================
export interface DependenciesResponse {
  dependencies: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    assignee: { id: string; name: string; avatarUrl: string | null } | null;
  }>;
  dependents: Array<{
    id: string;
    title: string;
    status: string;
  }>;
  isBlocked: boolean;
}

// ============================================
// Queries
// ============================================
export function useDependencies(taskId: string) {
  return useQuery<DependenciesResponse>({
    queryKey: ['dependencies', taskId],
    queryFn: async () => {
      const { data } = await api.get(`/tasks/${taskId}/dependencies`);
      return data;
    },
    enabled: !!taskId,
  });
}

// ============================================
// Mutations
// ============================================
export function useAddDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      dependsOnTaskId,
    }: {
      taskId: string;
      dependsOnTaskId: string;
    }) => {
      const response = await api.post(`/tasks/${taskId}/dependencies`, {
        dependsOnTaskId,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
      queryClient.invalidateQueries({
        queryKey: ['dependencies', variables.taskId],
      });
    },
  });
}

export function useRemoveDependency() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      dependsOnTaskId,
    }: {
      taskId: string;
      dependsOnTaskId: string;
    }) => {
      const response = await api.delete(
        `/tasks/${taskId}/dependencies/${dependsOnTaskId}`,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
      queryClient.invalidateQueries({
        queryKey: ['dependencies', variables.taskId],
      });
    },
  });
}