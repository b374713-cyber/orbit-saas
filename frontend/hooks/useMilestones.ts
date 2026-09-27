'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ============================================
// Types
// ============================================
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface Milestone {
  id: string;
  title: string;
  description: string | null;
  projectId: string;
  dueDate: string | null;
  status: MilestoneStatus;
  order: number;
  createdAt: string;
  updatedAt: string;
  progress?: number;
  tasksCount?: number;
  doneTasksCount?: number;
  _count?: { tasks: number };
  tasks?: any[];
}

// ============================================
// Queries
// ============================================
export function useMilestones(projectId: string) {
  return useQuery<Milestone[]>({
    queryKey: ['milestones', 'project', projectId],
    queryFn: async () => {
      const { data } = await api.get(`/projects/${projectId}/milestones`);
      return data;
    },
    enabled: !!projectId,
  });
}

export function useMilestone(id: string) {
  return useQuery<Milestone>({
    queryKey: ['milestones', id],
    queryFn: async () => {
      const { data } = await api.get(`/milestones/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

// ============================================
// Mutations
// ============================================
export function useCreateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      data,
    }: {
      projectId: string;
      data: {
        title: string;
        description?: string;
        dueDate?: string;
        status?: MilestoneStatus;
        order?: number;
      };
    }) => {
      const response = await api.post(
        `/projects/${projectId}/milestones`,
        data,
      );
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['milestones', 'project', variables.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId],
      });
    },
  });
}

export function useUpdateMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Milestone>;
    }) => {
      const response = await api.patch(`/milestones/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}

export function useDeleteMilestone() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/milestones/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}