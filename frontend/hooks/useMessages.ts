'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesApi } from '@/lib/api';
import { Message } from '@/types';

export function useMessages(projectId: string) {
  return useQuery<Message[]>({
    queryKey: ['messages', projectId],
    queryFn: async () => {
      const { data } = await messagesApi.list(projectId, 100);
      return data.reverse(); // Oldest first
    },
    enabled: !!projectId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      content,
    }: {
      projectId: string;
      content: string;
    }) => {
      const response = await messagesApi.send(projectId, content);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['messages', variables.projectId],
      });
    },
  });
}