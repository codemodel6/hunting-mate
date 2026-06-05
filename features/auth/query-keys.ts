import { createQueryKeys } from "@lukemorales/query-key-factory";

const authKeyFactory = createQueryKeys("auth", {
  status: null,
  me: null,
});

export const authKeys = {
  all: authKeyFactory._def,
  status: () => authKeyFactory.status.queryKey,
  me: () => authKeyFactory.me.queryKey,
} as const;
