import { supabase } from "@/lib/superbase";

const photoBucket = process.env.NEXT_PUBLIC_SUPABASE_PHOTO_BUCKET ?? "profile-photos";

type ProfileRow = {
  user_id: string;
  name?: string | null;
  height?: string | null;
  age?: string | null;
  location?: string | null;
  hearts?: number | null;
  photos?: string[] | null;
  has_active_match?: boolean | null;
};

type PostRow = {
  id: string;
  user_id: string;
  user_name?: string | null;
  title: string;
  content: string;
  created_at?: string | null;
};

type ChatRow = {
  id: string;
  user1_id: string;
  user2_id: string;
  match_requester?: string | null;
  match_status?: string | null;
  meet_success_user1?: boolean | null;
  meet_success_user2?: boolean | null;
};

type MessageRow = {
  id: number | string;
  chat_id: string;
  user_id: string;
  user_name?: string | null;
  message: string;
  created_at?: string | null;
};

type LocationRow = {
  chat_id: string;
  user_id: string;
  lat: number;
  lng: number;
};

async function getCurrentSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return session;
}

async function requireUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("로그인이 필요합니다.");
  }

  return user;
}

async function getProfileRow(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  if (error) {
    throw error;
  }

  return data;
}

function buildProfile(user: Awaited<ReturnType<typeof requireUser>>, row?: ProfileRow | null) {
  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;

  return {
    userId: user.id,
    name:
      row?.name ??
      (typeof metadata.name === "string" ? metadata.name : null) ??
      user.email?.split("@")[0] ??
      "",
    height:
      row?.height ?? (typeof metadata.height === "string" ? metadata.height : "") ?? "",
    age: row?.age ?? (typeof metadata.age === "string" ? metadata.age : "") ?? "",
    location:
      row?.location ??
      (typeof metadata.location === "string" ? metadata.location : "") ??
      "",
    hearts: row?.hearts ?? 0,
    photos: row?.photos ?? [],
    hasActiveMatch: row?.has_active_match ?? false,
  };
}

async function getProfileMap(userIds: string[]) {
  if (userIds.length === 0) {
    return new Map<string, ProfileRow>();
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .in("user_id", userIds);

  if (error) {
    throw error;
  }

  return new Map((data ?? []).map((profile) => [profile.user_id, profile as ProfileRow]));
}

function extractStoragePath(publicUrl: string) {
  const marker = `/storage/v1/object/public/${photoBucket}/`;
  const index = publicUrl.indexOf(marker);
  return index >= 0 ? publicUrl.slice(index + marker.length) : publicUrl;
}

export async function isAuthenticated() {
  const session = await getCurrentSession();
  return Boolean(session?.user?.id);
}

export async function getUserId() {
  const session = await getCurrentSession();
  return session?.user?.id ?? null;
}

export async function clearAuth() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getProfile() {
  const user = await requireUser();
  const row = await getProfileRow(user.id);
  return { profile: buildProfile(user, row) };
}

export async function updateProfile(data: {
  name?: string;
  height?: string;
  age?: string;
  location?: string;
}) {
  const user = await requireUser();

  const payload = {
    user_id: user.id,
    name: data.name ?? null,
    height: data.height ?? null,
    age: data.age ?? null,
    location: data.location ?? null,
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "user_id",
  });

  if (error) {
    throw error;
  }

  await supabase.auth.updateUser({
    data: {
      name: data.name ?? "",
      height: data.height ?? "",
      age: data.age ?? "",
      location: data.location ?? "",
    },
  });

  return getProfile();
}

export async function uploadPhoto(file: File) {
  const user = await requireUser();
  const filePath = `${user.id}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from(photoBucket)
    .upload(filePath, file, { upsert: false });

  if (uploadError) {
    throw uploadError;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(photoBucket).getPublicUrl(filePath);
  const currentProfile = await getProfile();
  const photos = [...(currentProfile.profile.photos ?? []), publicUrl];

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      photos,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }

  return { photos };
}

export async function deletePhoto(index: number) {
  const user = await requireUser();
  const currentProfile = await getProfile();
  const photos = [...(currentProfile.profile.photos ?? [])];
  const [deletedPhoto] = photos.splice(index, 1);

  if (deletedPhoto) {
    const { error: storageError } = await supabase.storage
      .from(photoBucket)
      .remove([extractStoragePath(deletedPhoto)]);

    if (storageError) {
      throw storageError;
    }
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      photos,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw error;
  }

  return { photos };
}

export async function getPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const posts = ((data ?? []) as PostRow[]).map((post) => ({
    postId: post.id,
    userId: post.user_id,
    userName: post.user_name ?? "익명",
    title: post.title,
    content: post.content,
    createdAt: post.created_at ?? new Date().toISOString(),
  }));

  return { posts };
}

export async function createPost(title: string, content: string) {
  const user = await requireUser();
  const profile = await getProfile();

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    user_name: profile.profile.name,
    title,
    content,
  });

  if (error) {
    throw error;
  }

  return { success: true };
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
  const otherUserIds = rows.map((chat) => (chat.user1_id === user.id ? chat.user2_id : chat.user1_id));
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

export async function getMessages(chatId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chatId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as MessageRow[];
  const profiles = await getProfileMap([...new Set(rows.map((message) => message.user_id))]);

  const messages = rows.map((message) => ({
    messageId: Number(message.id),
    userId: message.user_id,
    userName: message.user_name ?? profiles.get(message.user_id)?.name ?? "익명",
    message: message.message,
    timestamp: message.created_at ?? new Date().toISOString(),
  }));

  return { messages };
}

export async function sendMessage(chatId: string, message: string) {
  const user = await requireUser();
  const profile = await getProfile();

  const { error } = await supabase.from("messages").insert({
    chat_id: chatId,
    user_id: user.id,
    user_name: profile.profile.name,
    message,
  });

  if (error) {
    throw error;
  }

  return { success: true };
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

export async function shareLocation(chatId: string, lat: number, lng: number) {
  const user = await requireUser();
  const profileResponse = await getProfile();
  const nextHearts = Math.max((profileResponse.profile.hearts ?? 0) - 1, 0);

  const { error: locationError } = await supabase.from("locations").upsert(
    {
      chat_id: chatId,
      user_id: user.id,
      lat,
      lng,
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

export async function unlockAdditionalMatch() {
  return { success: true };
}
