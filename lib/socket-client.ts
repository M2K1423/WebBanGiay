import { getApiBaseUrl } from "@/features/auth/utils";

export type SocketClient = {
  on: (event: string, callback: (...args: any[]) => void) => SocketClient;
  emit: (event: string, payload?: unknown, callback?: (response: any) => void) => SocketClient;
  disconnect: () => void;
};

type SocketFactory = (
  url: string,
  options?: { transports?: string[]; auth?: Record<string, string> }
) => SocketClient;

export function getRealtimeBaseUrl() {
  return process.env.NEXT_PUBLIC_REALTIME_URL ?? getApiBaseUrl().replace(/\/api\/?$/, "");
}

export function loadSocketFactory(): Promise<SocketFactory> {
  const realtimeUrl = getRealtimeBaseUrl();
  const target = window as unknown as { io?: SocketFactory };
  if (target.io) return Promise.resolve(target.io);

  return new Promise((resolve, reject) => {
    const finish = () => target.io ? resolve(target.io) : reject(new Error("Không tải được Socket.IO client."));
    const existing = document.querySelector<HTMLScriptElement>("script[data-socket-io-client='true']");
    if (existing) {
      existing.addEventListener("load", finish, { once: true });
      existing.addEventListener("error", () => reject(new Error("Không kết nối được máy chủ chat.")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = `${realtimeUrl}/socket.io/socket.io.js`;
    script.async = true;
    script.dataset.socketIoClient = "true";
    script.addEventListener("load", finish, { once: true });
    script.addEventListener("error", () => reject(new Error("Không kết nối được máy chủ chat.")), { once: true });
    document.body.appendChild(script);
  });
}
