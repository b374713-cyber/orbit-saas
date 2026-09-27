'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';

export interface Subscription {
  id: string;
  organizationId: string;
  plan: 'FREE' | 'PRO' | 'BUSINESS';
  status: 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE' | 'TRIALING';
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function useSubscription(organizationId: string) {
  return useQuery<Subscription>({
    queryKey: ['subscription', organizationId],
    queryFn: async () => {
      const { data } = await api.get(
        `/stripe/subscription/${organizationId}`,
      );
      return data;
    },
    enabled: !!organizationId,
  });
}

export function useCreateCheckout() {
  return useMutation({
    mutationFn: async (data: {
      organizationId: string;
      plan: 'PRO' | 'BUSINESS';
    }) => {
      const response = await api.post('/stripe/checkout', data);
      return response.data;
    },
  });
}

export function useCreatePortal() {
  return useMutation({
    mutationFn: async (organizationId: string) => {
      const response = await api.post('/stripe/portal', { organizationId });
      return response.data;
    },
  });
}

export function useVerifyCheckout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await api.post('/stripe/verify-checkout', {
        sessionId,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
    },
  });
}