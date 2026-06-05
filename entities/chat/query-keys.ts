import { createQueryKeys } from "@lukemorales/query-key-factory";

const chatKeyFactory = createQueryKeys("chats", {
  lists: null,
  list: null,
  detail: (id: string) => [id],
});

export const chatKeys = {
  all: chatKeyFactory._def,
  lists: () => chatKeyFactory.lists.queryKey,
  list: () => chatKeyFactory.list.queryKey,
  detail: (id: string) => chatKeyFactory.detail(id).queryKey,
} as const;
