import { supabase } from "@/shared/supabase";
import { requireUser } from "@/shared/lib/supabase/helpers";
import { getProfile } from "@/entities/profile/api";

type LocationRow = {
  chat_id: string;
  user_id: string;
  lat: number;
  lng: number;
};

export async function shareLocation(payload: {
  chatId: string;
  lat: number;
  lng: number;
}) {
  const user = await requireUser();
  const profileResponse = await getProfile();
  const nextHearts = Math.max((profileResponse.profile.hearts ?? 0) - 1, 0);

  const { error: locationError } = await supabase.from("locations").upsert(
    {
      chat_id: payload.chatId,
      user_id: user.id,
      lat: payload.lat,
      lng: payload.lng,
    } satisfies LocationRow,
    { onConflict: "chat_id,user_id" },
  );

  if (locationError) {
    throw locationError;
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .update({ hearts: nextHearts })
    .eq("user_id", user.id);

  if (profileError) {
    throw profileError;
  }

  return { hearts: nextHearts };
}

export async function getLocation(chatId: string, userId: string) {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("chat_id", chatId)
    .eq("user_id", userId)
    .single();

  if (error) {
    throw error;
  }

  return {
    location: {
      lat: (data as LocationRow).lat,
      lng: (data as LocationRow).lng,
    },
  };
}
