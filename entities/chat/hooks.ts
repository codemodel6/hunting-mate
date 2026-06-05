"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/entities/chat/api";
import { chatKeys } from "@/entities/chat/query-keys";
import { messageKeys } from "@/entities/message/query-keys";

export function useChatsQuery(enabled = true) {
  return useQuery({
    queryKey: chatKeys.lists(),
    queryFn: api.getChats,
    enabled,
  });
}

export function useChatDetailQuery(chatId: string, enabled = true) {
  return useQuery({
    queryKey: chatKeys.detail(chatId),
    queryFn: () => api.getChat(chatId),
    enabled: enabled && Boolean(chatId),
  });
}

export function useRequestChatMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.requestChat,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: chatKeys.lists() }),
  });
}

export function useRequestMatchMutation(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.requestMatch(chatId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) }),
        queryClient.invalidateQueries({ queryKey: chatKeys.lists() }),
      ]);
    },
  });
}

export function useAcceptMatchMutation(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.acceptMatch(chatId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) }),
        queryClient.invalidateQueries({ queryKey: chatKeys.lists() }),
      ]);
    },
  });
}

export function useMarkMeetSuccessMutation(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => api.markMeetSuccess(chatId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) }),
  });
}

export function useUnlockAdditionalMatchMutation(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.unlockAdditionalMatch,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: chatKeys.detail(chatId) }),
        queryClient.invalidateQueries({ queryKey: messageKeys.list(chatId) }),
      ]);
    },
  });
}
