import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";
import { getRealtimeBaseUrl } from "@/lib/socket-client";

export const MAX_CHAT_IMAGE_SIZE = 5 * 1024 * 1024;
export const CHAT_IMAGE_ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

export function resolveChatImageUrl(imageUrl: string) {
  return imageUrl.startsWith("http") ? imageUrl : `${getRealtimeBaseUrl()}${imageUrl}`;
}

export async function uploadChatImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Vui lòng chọn một tệp hình ảnh.");
  if (file.size > MAX_CHAT_IMAGE_SIZE) throw new Error("Ảnh không được lớn hơn 5 MB.");

  const user = getFirebaseAuth()?.currentUser;
  if (!user) throw new Error("Bạn cần đăng nhập để gửi ảnh.");
  const token = await user.getIdToken();
  const formData = new FormData();
  formData.append("image", file);
  const response = await fetch(`${getApiBaseUrl()}/chat/upload`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.imageUrl) {
    throw new Error(data?.message || "Không tải được ảnh lên.");
  }
  return String(data.imageUrl);
}
