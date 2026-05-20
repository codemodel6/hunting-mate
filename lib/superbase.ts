import { createClient } from "@supabase/supabase-js";

const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ??
  (projectId ? `https://${projectId}.supabase.co` : undefined);

if (!supabaseUrl) {
  throw new Error(
    "Missing Supabase project URL. Set NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PROJECT_ID.",
  );
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);
