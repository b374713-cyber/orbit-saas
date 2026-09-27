'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organizationsApi } from '@/lib/api';
import { Organization, Role } from '@/types';

// ============================================
// Queries
// ============================================
export function useOrganizations() {
  return useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data } = await organizationsApi.list();
      return data;
    },
  });
}

export function useOrganization(id: string) {
  return useQuery<Organization>({
    queryKey: ['organizations', id],
    queryFn: async () => {
      const { data } = await organizationsApi.get(id);
      return data;
    },
    enabled: !!id,
  });
}

// ============================================
// Mutations
// ============================================
export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      slug: string;
      description?: string;
    }) => {
      const response = await organizationsApi.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useUpdateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: Partial<Organization>;
    }) => {
      const response = await organizationsApi.update(id, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({
        queryKey: ['organizations', variables.id],
      });
    },
  });
}

export function useDeleteOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await organizationsApi.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}

export function useInviteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      organizationId,
      email,
      role,
    }: {
      organizationId: string;
      email: string;
      role?: Role;
    }) => {
      const response = await organizationsApi.inviteMember(organizationId, {
        email,
        role,
      });
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['organizations', variables.organizationId],
      });
    },
  });
}