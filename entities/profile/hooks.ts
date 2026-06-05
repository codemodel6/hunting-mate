"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/entities/profile/api";
import { profileKeys } from "@/entities/profile/query-keys";

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: profileKeys.me(),
    queryFn: api.getProfile,
    enabled,
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateProfile,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.me() }),
  });
}

export function useUploadPhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.uploadPhoto,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.me() }),
  });
}

export function useDeletePhotoMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deletePhoto,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.me() }),
  });
}
