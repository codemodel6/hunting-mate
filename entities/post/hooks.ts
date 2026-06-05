"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import * as api from "@/entities/post/api";
import { postKeys } from "@/entities/post/query-keys";

export function usePostsQuery(enabled = true) {
  return useQuery({
    queryKey: postKeys.lists(),
    queryFn: api.getPosts,
    enabled,
  });
}

export function useCreatePostMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createPost,
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: postKeys.lists() }),
  });
}
