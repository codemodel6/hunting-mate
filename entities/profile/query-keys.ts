import { createQueryKeys } from "@lukemorales/query-key-factory";

const profileKeyFactory = createQueryKeys("profiles", {
  me: null,
});

export const profileKeys = {
  all: profileKeyFactory._def,
  me: () => profileKeyFactory.me.queryKey,
} as const;
