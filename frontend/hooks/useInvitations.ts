'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

// ============================================
// Types
// ============================================
export interface Invitation {
  id: string;
  token: string;
  email: string;
  organizationId: string;
  inviterId: string;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'VIEWER';
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';
  expiresAt: string;
  createdAt: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string | null;
  };
  inviter?: {
    id: string;
    name: string;
    email: string;
  };
}

// ============================================
// Queries
// ============================================
export function useInvitation(token: string) {
  return useQuery<Invitation>({
    queryKey: ['invitations', token],
    queryFn: async () => {
      const { data } = await api.get(`/invitations/${token}`);
      return data;
    },
    enabled: !!token,
    retry: false,
  });
}

export function useMyPendingInvitations() {
  return useQuery<Invitation[]>({
    queryKey: ['invitations', 'me', 'pending'],
    queryFn: async () => {
      const { data } = await api.get('/invitations/me/pending');
      return data;
    },
  });
}

// ============================================
// Mutations
// ============================================
export function useAcceptInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post(`/invitations/${token}/accept`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}

export function useDeclineInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      const response = await api.post(`/invitations/${token}/decline`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invitations'] });
    },
  });
}