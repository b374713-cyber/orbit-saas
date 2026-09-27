'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tasksApi } from '@/lib/api';
import { Task, KanbanData, TaskStatus, TaskPriority } from '@/types';

// ============================================
// Queries
// ============================================
export function useTasks(projectId: string) {
  return useQuery<KanbanData>({
    queryKey: ['tasks', 'project', projectId],
    queryFn: async () => {
      const { data } = await tasksApi.listByProject(projectId);
      return data;
    },
    enabled: !!projectId,
  });
}

export function useTask(id: string) {
  return useQuery<Task>({
    queryKey: ['tasks', id],
    queryFn: async () => {
      const { data } = await tasksApi.get(id);
      return data;
    },
    enabled: !!id,
  });
}

// ============================================
// Mutations
// ============================================
export function useCreateTask() {
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
        status?: TaskStatus;
        priority?: TaskPriority;
        assigneeId?: string;
        milestoneId?: string;
        dueDate?: string;
      };
    }) => {
      const response = await tasksApi.create(projectId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['tasks', 'project', variables.projectId],
      });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({
        queryKey: ['projects', variables.projectId],
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Task>;
    }) => {
      const response = await tasksApi.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}

export function useMoveTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
      order,
    }: {
      id: string;
      status: TaskStatus;
      order?: number;
    }) => {
      const response = await tasksApi.move(id, { status, order });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dependencies'] });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await tasksApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['milestones'] });
    },
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      taskId,
      content,
    }: {
      taskId: string;
      content: string;
    }) => {
      const response = await tasksApi.addComment(taskId, content);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tasks', variables.taskId] });
    },
  });
}