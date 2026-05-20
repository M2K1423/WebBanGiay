export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Co loi xay ra. Vui long thu lai.";
}

export type AuthMode = "login" | "register";
