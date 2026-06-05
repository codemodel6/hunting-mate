import { supabase } from "@/shared/supabase";
import { getProfileMap, getProfileRow, requireUser } from "@/shared/lib/supabase/helpers";

type ChatRow = {
  id: string;
  user1_id: string;
  user2_id: string;
  match_requester?: string | null;
  match_status?: string | null;
  meet_success_user1?: boolean | null;
  meet_success_user2?: boolean | null;
};

export async function getChats() {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`);

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ChatRow[];
  const otherUserIds = rows.map((chat) =>
    chat.user1_id === user.id ? chat.user2_id : chat.user1_id,
  );
  const profiles = await getProfileMap(otherUserIds);

  const chats = rows.map((chat) => {
    const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
    const otherProfile = profiles.get(otherUserId);

    return {
      chatId: chat.id,
      matchStatus: chat.match_status ?? "none",
      otherUser: {
        name: otherProfile?.name ?? "익명",
        photos: otherProfile?.photos ?? [],
      },
    };
  });

  return { chats };
}

export async function getChat(chatId: string) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .single();

  if (error) {
    throw error;
  }

  const chat = data as ChatRow;
  const otherUserId = chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
  const otherProfile = await getProfileRow(otherUserId);

  return {
    chat: {
      chatId: chat.id,
      user1Id: chat.user1_id,
      user2Id: chat.user2_id,
      matchRequester: chat.match_requester ?? null,
      matchStatus: chat.match_status ?? "none",
      meetSuccessUser1: chat.meet_success_user1 ?? false,
      meetSuccessUser2: chat.meet_success_user2 ?? false,
      otherUser: {
        userId: otherUserId,
        name: otherProfile?.name ?? "익명",
        photos: otherProfile?.photos ?? [],
        height: otherProfile?.height ?? undefined,
        age: otherProfile?.age ?? undefined,
        location: otherProfile?.location ?? undefined,
      },
    },
  };
}

export async function requestChat(postUserId: string) {
  const user = await requireUser();

  const { data, error } = await supabase
    .from("chats")
    .insert({
      user1_id: user.id,
      user2_id: postUserId,
      match_status: "none",
    })
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  return { chatId: data.id as string };
}

export async function requestMatch(chatId: string) {
  const user = await requireUser();
  const { error } = await supabase
    .from("chats")
    .update({ match_status: "requested", match_requester: user.id })
    .eq("id", chatId);

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function acceptMatch(chatId: string) {
  const { error } = await supabase
    .from("chats")
    .update({ match_status: "matched" })
    .eq("id", chatId);

  if (error) {
    throw error;
  }

  return { success: true };
}

export async function markMeetSuccess(chatId: string) {
  const user = await requireUser();
  const { data, error } = await supabase
    .from("chats")
    .select("*")
    .eq("id", chatId)
    .single();

  if (error) {
    throw error;
  }

  const chat = data as ChatRow;
  const updates =
    chat.user1_id === user.id
      ? { meet_success_user1: true }
      : { meet_success_user2: true };

  const { error: updateError } = await supabase
    .from("chats")
    .update(updates)
    .eq("id", chatId);

  if (updateError) {
    throw updateError;
  }

  return { success: true };
}

export async function unlockAdditionalMatch() {
  return { success: true };
}
