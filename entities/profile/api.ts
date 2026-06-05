import { supabase } from "@/shared/supabase";
import {
  buildProfile,
  extractStoragePath,
  getProfileRow,
  photoBucket,
  requireUser,
} from "@/shared/lib/supabase/helpers";

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

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      name: data.name ?? "",
      height: data.height ?? "",
      age: data.age ?? "",
      location: data.location ?? "",
    },
  });

  if (authError) {
    throw authError;
  }

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
