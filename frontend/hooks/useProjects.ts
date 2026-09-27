'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/lib/api';
import { Project } from '@/types';

// ============================================
// Queries
// ============================================
export function useProjects(organizationId: string) {
  return useQuery<Project[]>({
    queryKey: ['projects', 'organization', organizationId],
    queryFn: async () => {
      const { data } = await projectsApi.listByOrganization(organizationId);
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useProject(id: string) {
  return useQuery<Project>({
    queryKey: ['projects', id],
    queryFn: async () => {
      const { data } = await projectsApi.get(id);
      return data;
    },
    enabled: !!id,
  });
}

// ============================================
// Mutations
// ============================================
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      data,
    }: {
      organizationId: string;
      data: {
        name: string;
        description?: string;
        startDate?: string;
        endDate?: string;
      };
    }) => {
      const response = await projectsApi.create(organizationId, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['projects', 'organization', variables.organizationId],
      });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({
        queryKey: ['organizations', variables.organizationId],
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Project>;
    }) => {
      const response = await projectsApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects', variables.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await projectsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}