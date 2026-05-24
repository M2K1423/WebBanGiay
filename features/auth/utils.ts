import type { User } from "firebase/auth";

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Co loi xay ra. Vui long thu lai.";
}

export type AuthMode = "login" | "register";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
}

export async function syncUserProfile(user: User) {
  const response = await fetch(`${getApiBaseUrl()}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      uid: user.uid,
      email: user.email ?? undefined,
      displayName: user.displayName ?? undefined,
      photoURL: user.photoURL ?? undefined,
      provider: user.providerData[0]?.providerId ?? "password"
    })
  });

  if (!response.ok) {
    throw new Error("Khong dong bo duoc thong tin nguoi dung.");
  }

  return response.json().catch(() => null);
}
