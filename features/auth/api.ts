import { supabase } from "@/shared/supabase";
import { getCurrentSession, requireUser } from "@/shared/lib/supabase/helpers";

export async function getAuthStatus() {
  const session = await getCurrentSession();
  return Boolean(session?.user?.id);
}

export async function getCurrentUserId() {
  const session = await getCurrentSession();
  return session?.user?.id ?? null;
}

export async function signInWithPassword(payload: {
  email: string;
  password: string;
}) {
  const { error } = await supabase.auth.signInWithPassword(payload);

  if (error) {
    throw error;
  }
}

export async function signUpWithPassword(payload: {
  email: string;
  password: string;
  name: string;
  height: string;
  age: string;
  location: string;
}) {
  const { error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        name: payload.name,
        height: payload.height,
        age: payload.age,
        location: payload.location,
      },
    },
  });

  if (error) {
    throw error;
  }
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getCurrentUser() {
  return requireUser();
}
