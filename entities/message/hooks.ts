"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/entities/message/api";
import { messageKeys } from "@/entities/message/query-keys";

export function useMessagesQuery(chatId: string, enabled = true) {
  return useQuery({
    queryKey: messageKeys.list(chatId),
    queryFn: () => api.getMessages(chatId),
    enabled: enabled && Boolean(chatId),
    refetchInterval: 3000,
  });
}

export function useSendMessageMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.sendMessage,
    onSuccess: (_, variables) =>
      queryClient.invalidateQueries({
        queryKey: messageKeys.list(variables.chatId),
      }),
  });
}
