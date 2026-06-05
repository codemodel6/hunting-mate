import { createQueryKeys } from "@lukemorales/query-key-factory";

const messageKeyFactory = createQueryKeys("messages", {
  lists: null,
  list: (chatId: string) => [chatId],
  detail: (id: string) => [id],
});

export const messageKeys = {
  all: messageKeyFactory._def,
  lists: () => messageKeyFactory.lists.queryKey,
  list: (chatId: string) => messageKeyFactory.list(chatId).queryKey,
  detail: (id: string) => messageKeyFactory.detail(id).queryKey,
} as const;
