import { createQueryKeys } from "@lukemorales/query-key-factory";

const locationKeyFactory = createQueryKeys("locations", {
  detail: (chatId: string, userId: string) => [chatId, userId],
});

export const locationKeys = {
  all: locationKeyFactory._def,
  detail: (chatId: string, userId: string) =>
    locationKeyFactory.detail(chatId, userId).queryKey,
} as const;
