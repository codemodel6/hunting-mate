import { supabase } from "@/shared/supabase";
import { requireUser } from "@/shared/lib/supabase/helpers";
import { getProfile } from "@/entities/profile/api";

type PostRow = {
  id: string;
  user_id: string;
  user_name?: string | null;
  title: string;
  content: string;
  created_at?: string | null;
};

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

export async function createPost(payload: { title: string; content: string }) {
  const user = await requireUser();
  const profile = await getProfile();

  const { error } = await supabase.from("posts").insert({
    user_id: user.id,
    user_name: profile.profile.name,
    title: payload.title,
    content: payload.content,
  });

  if (error) {
    throw error;
  }

  return { success: true };
}
