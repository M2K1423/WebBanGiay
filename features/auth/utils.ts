import type { User } from "firebase/auth";

export function getFriendlyErrorMessage(error: any): string {
  if (error && typeof error === "object") {
    const code = error.code || "";
    switch (code) {
      case "auth/user-not-found":
        return "Email này chưa được đăng ký trong hệ thống.";
      case "auth/invalid-email":
        return "Địa chỉ email không hợp lệ.";
      case "auth/wrong-password":
        return "Mật khẩu không chính xác.";
      case "auth/email-already-in-use":
        return "Email này đã được đăng ký bởi một tài khoản khác.";
      case "auth/weak-password":
        return "Mật khẩu quá yếu (phải chứa ít nhất 6 ký tự).";
      case "auth/invalid-credential":
        return "Thông tin đăng nhập không chính xác (sai email hoặc mật khẩu).";
      case "auth/user-disabled":
        return "Tài khoản này đã bị khóa.";
      case "auth/too-many-requests":
        return "Tài khoản bị tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau.";
      default:
        break;
    }
    if (error.message) return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Có lỗi xảy ra. Vui lòng thử lại.";
}

export type AuthMode = "login" | "register" | "forgot-password";

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001/api";
}

export async function syncUserProfile(user: User) {
  const token = await user.getIdToken();
  const response = await fetch(`${getApiBaseUrl()}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
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
