import { createQueryKeys } from "@lukemorales/query-key-factory";

const postKeyFactory = createQueryKeys("posts", {
  lists: null,
  list: null,
  detail: (id: string) => [id],
});

export const postKeys = {
  all: postKeyFactory._def,
  lists: () => postKeyFactory.lists.queryKey,
  list: () => postKeyFactory.list.queryKey,
  detail: (id: string) => postKeyFactory.detail(id).queryKey,
} as const;
