const projectId = process.env.NEXT_PUBLIC_SUPABASE_PROJECT_ID;
const publicAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const fallbackApiBase = projectId
  ? `https://${projectId}.supabase.co/functions/v1/make-server-792a4835`
  : "";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? fallbackApiBase;

function readStorage(key: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(key);
}

function writeStorage(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, value);
}

function removeStorage(key: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(key);
}

export function getAuthToken() {
  return readStorage("accessToken");
}

export function setAuthToken(token: string) {
  writeStorage("accessToken", token);
}

export function getUserId() {
  return readStorage("userId");
}

export function setUserId(userId: string) {
  writeStorage("userId", userId);
}

export function clearAuth() {
  removeStorage("accessToken");
  removeStorage("userId");
}

export function isAuthenticated() {
  return Boolean(getAuthToken());
}

async function apiCall(endpoint: string, options: RequestInit = {}) {
  if (!API_BASE) {
    throw new Error(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE or NEXT_PUBLIC_SUPABASE_PROJECT_ID.",
    );
  }

  const token = getAuthToken();
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  } else if (publicAnonKey) {
    headers.set("Authorization", `Bearer ${publicAnonKey}`);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "API call failed";

    try {
      const error = await response.json();
      message = error.error || error.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json();
}

export async function signup(data: {
  email: string;
  password: string;
  name: string;
  height?: string;
  age?: string;
  location?: string;
}) {
  return apiCall("/signup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function signin(email: string, password: string) {
  return apiCall("/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function getProfile() {
  return apiCall("/profile");
}

export async function updateProfile(data: {
  name?: string;
  height?: string;
  age?: string;
  location?: string;
}) {
  return apiCall("/profile", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function uploadPhoto(file: File) {
  if (!API_BASE) {
    throw new Error(
      "API base URL is not configured. Set NEXT_PUBLIC_API_BASE or NEXT_PUBLIC_SUPABASE_PROJECT_ID.",
    );
  }

  const token = getAuthToken();
  const formData = new FormData();
  formData.append("photo", file);

  const response = await fetch(`${API_BASE}/upload-photo`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    let message = "Upload failed";

    try {
      const error = await response.json();
      message = error.error || error.message || message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return response.json();
}

export async function deletePhoto(index: number) {
  return apiCall(`/photo/${index}`, {
    method: "DELETE",
  });
}

export async function getPosts() {
  return apiCall("/posts");
}

export async function createPost(title: string, content: string) {
  return apiCall("/posts", {
    method: "POST",
    body: JSON.stringify({ title, content }),
  });
}

export async function requestChat(postUserId: string) {
  return apiCall("/chat/request", {
    method: "POST",
    body: JSON.stringify({ postUserId }),
  });
}

export async function getChats() {
  return apiCall("/chats");
}

export async function getChat(chatId: string) {
  return apiCall(`/chat/${chatId}`);
}

export async function sendMessage(chatId: string, message: string) {
  return apiCall(`/chat/${chatId}/message`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export async function getMessages(chatId: string) {
  return apiCall(`/chat/${chatId}/messages`);
}

export async function requestMatch(chatId: string) {
  return apiCall(`/chat/${chatId}/match-request`, {
    method: "POST",
  });
}

export async function acceptMatch(chatId: string) {
  return apiCall(`/chat/${chatId}/match-accept`, {
    method: "POST",
  });
}

export async function markMeetSuccess(chatId: string) {
  return apiCall(`/chat/${chatId}/meet-success`, {
    method: "POST",
  });
}

export async function shareLocation(chatId: string, lat: number, lng: number) {
  return apiCall("/share-location", {
    method: "POST",
    body: JSON.stringify({ chatId, lat, lng }),
  });
}

export async function getLocation(chatId: string, userId: string) {
  return apiCall(`/location/${chatId}/${userId}`);
}

export async function unlockAdditionalMatch() {
  return apiCall("/unlock-additional-match", {
    method: "POST",
  });
}
