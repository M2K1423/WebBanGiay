"use client";

import Link from "next/link";
import { ChangeEvent, ClipboardEvent, FormEvent, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { FaComments, FaHeadset, FaImage, FaPaperPlane, FaPowerOff, FaXmark } from "react-icons/fa6";
import { getFirebaseAuth } from "@/lib/firebase";
import { getRealtimeBaseUrl, loadSocketFactory, type SocketClient } from "@/lib/socket-client";
import type { ChatConversation, ChatMessage } from "./types";
import { CHAT_IMAGE_ACCEPT, MAX_CHAT_IMAGE_SIZE, resolveChatImageUrl, uploadChatImage } from "./images";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [conversation, setConversation] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [status, setStatus] = useState("Đang kết nối...");
  const [notice, setNotice] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const socketRef = useRef<SocketClient | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setStatus("Firebase chưa được cấu hình.");
      return;
    }
    return onAuthStateChanged(auth, setUser);
  }, []);

  useEffect(() => {
    socketRef.current?.disconnect();
    socketRef.current = null;
    setConversation(null);
    setMessages([]);
    if (!user) {
      setStatus("Đăng nhập để trò chuyện với Myshoes.");
      return;
    }

    let cancelled = false;
    void (async () => {
      try {
        setStatus("Đang kết nối...");
        const [factory, token] = await Promise.all([loadSocketFactory(), user.getIdToken()]);
        if (cancelled) return;
        const socket = factory(`${getRealtimeBaseUrl()}/chat`, {
          transports: ["websocket", "polling"], auth: { token }
        });
        socketRef.current = socket;
        socket.on("connect", () => setStatus("Đang trực tuyến"));
        socket.on("disconnect", () => setStatus("Mất kết nối, đang thử lại..."));
        socket.on("chat.ready", (payload: { role: string; conversation?: ChatConversation }) => {
          setIsAdmin(payload.role === "admin");
          if (payload.conversation) setConversation(payload.conversation);
          setStatus("Đang trực tuyến");
          setNotice("");
        });
        socket.on("message.history", (history: ChatMessage[]) => setMessages(Array.isArray(history) ? history : []));
        socket.on("conversation.active", (activeConversation: ChatConversation) => {
          setConversation(activeConversation);
          setStatus("Đang trực tuyến");
          setNotice("");
        });
        socket.on("conversation.ended", (payload: { conversationId: string }) => {
          setConversation((current) => current?.id === payload.conversationId ? null : current);
          setMessages([]);
          setStatus("Đang trực tuyến");
          setNotice("Cuộc trò chuyện đã kết thúc. Tin nhắn mới sẽ tạo một cuộc trò chuyện khác.");
        });
        socket.on("message.created", (message: ChatMessage) => {
          setNotice("");
          setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
          if (document.visibilityState === "visible") socket.emit("chat.read", { conversationId: message.conversationId });
        });
        const showError = (error: { message?: string } | string) =>
          setStatus(typeof error === "string" ? error : error?.message || "Chat gặp lỗi.");
        socket.on("chat.error", showError);
        socket.on("exception", showError);
      } catch (error) {
        if (!cancelled) setStatus(error instanceof Error ? error.message : "Không kết nối được chat.");
      }
    })();

    return () => {
      cancelled = true;
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  useEffect(() => {
    if (open) {
      const messageList = messageListRef.current;
      messageList?.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
      if (conversation) socketRef.current?.emit("chat.read", { conversationId: conversation.id });
    }
  }, [messages, open, conversation]);

  useEffect(() => () => {
    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
  }, [pendingImagePreview]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if ((!content && !pendingImage) || !socketRef.current || uploading) return;
    setUploading(true);
    try {
      const imageUrl = pendingImage ? await uploadChatImage(pendingImage) : undefined;
      socketRef.current.emit("chat.send", { conversationId: conversation?.id, content, imageUrl });
      setDraft("");
      setPendingImage(null);
      setPendingImagePreview("");
      setNotice("");
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Không gửi được ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const prepareImage = (file: File) => {
    if (!CHAT_IMAGE_ACCEPT.includes(file.type) || file.size > MAX_CHAT_IMAGE_SIZE) {
      setNotice(file.size > MAX_CHAT_IMAGE_SIZE ? "Ảnh không được lớn hơn 5 MB." : "Chỉ hỗ trợ JPG, PNG, WEBP và GIF.");
      return;
    }
    setPendingImage(file);
    setPendingImagePreview(URL.createObjectURL(file));
    setNotice("");
  };

  const selectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) prepareImage(file);
  };

  const pasteImage = (event: ClipboardEvent<HTMLInputElement>) => {
    const imageItem = [...event.clipboardData.items].find((item) => item.type.startsWith("image/"));
    const file = imageItem?.getAsFile();
    if (!file) return;
    event.preventDefault();
    prepareImage(file);
  };

  const endConversation = () => {
    if (!conversation || !socketRef.current) return;
    if (!window.confirm("Kết thúc cuộc trò chuyện? Toàn bộ lịch sử tin nhắn sẽ bị xóa.")) return;
    socketRef.current.emit("chat.end", { conversationId: conversation.id });
  };

  if (isAdmin) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[70]">
      {open ? (
        <section className="mb-3 flex h-[min(610px,calc(100vh-105px))] w-[min(400px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.25)]">
          <header className="shrink-0 bg-gradient-to-br from-[#0d3a6b] to-[#13589a] px-4 pb-4 pt-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-lg ring-1 ring-white/20">
                <FaHeadset />
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-[#13589a] bg-emerald-400" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[15px] font-bold">Myshoes Support</p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-white/70"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />{status}</p>
              </div>
              {conversation ? (
                <button type="button" onClick={endConversation} className="flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[11px] font-bold text-white/90 ring-1 ring-white/15 transition hover:bg-rose-500" title="Xóa toàn bộ lịch sử trò chuyện"><FaPowerOff /> Kết thúc</button>
              ) : null}
              <button type="button" onClick={() => setOpen(false)} className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white" aria-label="Đóng chat"><FaXmark /></button>
            </div>
          </header>
          {!user ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <FaComments className="mb-4 text-4xl text-[#0d3a6b]" />
              <p className="font-bold text-slate-900">Bạn cần đăng nhập</p>
              <p className="mt-2 text-sm text-slate-500">Đăng nhập để lưu lịch sử và nhận phản hồi từ cửa hàng.</p>
              <Link href="/login" className="mt-5 rounded-full bg-[#0d3a6b] px-5 py-2.5 text-sm font-bold text-white">Đăng nhập</Link>
            </div>
          ) : (
            <>
              <div ref={messageListRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-[#f4f7fb] p-4">
                {notice ? <div className="mx-auto max-w-[92%] rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-xs leading-5 text-amber-700">{notice}</div> : null}
                {messages.length === 0 ? (
                  <div className="flex min-h-full flex-col items-center justify-center px-3 py-8 text-center">
                    <div className="grid h-16 w-16 place-items-center rounded-3xl bg-white text-2xl text-[#0d3a6b] shadow-sm ring-1 ring-slate-200"><FaHeadset /></div>
                    <p className="mt-4 text-base font-bold text-slate-900">Myshoes có thể giúp gì cho bạn?</p>
                    <p className="mt-1 max-w-64 text-xs leading-5 text-slate-500">Đội ngũ hỗ trợ thường phản hồi trong vài phút.</p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {["Tư vấn sản phẩm", "Kiểm tra đơn hàng"].map((suggestion) => <button key={suggestion} type="button" onClick={() => setDraft(suggestion)} className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-[#0d3a6b] hover:text-[#0d3a6b]">{suggestion}</button>)}
                    </div>
                  </div>
                ) : null}
                {messages.map((message) => {
                  const mine = message.senderRole === "customer";
                  return (
                    <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${mine ? "rounded-br-md bg-[#0d3a6b] text-white" : "rounded-bl-md border border-slate-200/80 bg-white text-slate-800"}`}>
                        {!mine ? <p className="mb-1 text-[10px] font-bold text-[#0d3a6b]">Myshoes Support</p> : null}
                        {message.imageUrl ? <a href={resolveChatImageUrl(message.imageUrl)} target="_blank" rel="noreferrer"><img src={resolveChatImageUrl(message.imageUrl)} alt="Ảnh trong cuộc trò chuyện" className="mb-2 max-h-56 w-full rounded-xl object-cover" /></a> : null}
                        {message.content ? <p className="whitespace-pre-wrap break-words leading-5">{message.content}</p> : null}
                        <p className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-slate-400"}`}>{new Date(message.createdAt).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              {pendingImagePreview ? <div className="flex shrink-0 items-center gap-3 border-t border-slate-200/80 bg-white px-4 pt-3"><img src={pendingImagePreview} alt="Ảnh chuẩn bị gửi" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-700">{pendingImage?.name}</p><p className="mt-1 text-[10px] text-slate-400">Ảnh sẽ được gửi cùng tin nhắn</p></div><button type="button" onClick={() => { setPendingImage(null); setPendingImagePreview(""); }} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-500" aria-label="Bỏ ảnh"><FaXmark /></button></div> : null}
              <form onSubmit={submit} className="flex shrink-0 items-center gap-2 border-t border-slate-200/80 bg-white p-3.5">
                <input ref={imageInputRef} type="file" accept={CHAT_IMAGE_ACCEPT} onChange={selectImage} className="hidden" />
                <button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-[#0d3a6b] disabled:opacity-50" aria-label="Chọn ảnh"><FaImage /></button>
                <div className="min-w-0 flex-1 rounded-full bg-slate-100 px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-[#0d3a6b]/30">
                  <input value={draft} onChange={(event) => setDraft(event.target.value)} onPaste={pasteImage} maxLength={2000} placeholder="Nhập Tin Nhắn" className="h-11 w-full bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400" />
                </div>
                <button type="submit" disabled={(!draft.trim() && !pendingImage) || uploading} className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#0d3a6b] text-white shadow-md shadow-blue-950/20 transition hover:-translate-y-0.5 hover:bg-[#13589a] disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none" aria-label="Gửi tin nhắn"><FaPaperPlane /></button>
              </form>
            </>
          )}
        </section>
      ) : null}
      <button suppressHydrationWarning type="button" onClick={() => setOpen((value) => !value)} className="ml-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#0d3a6b] to-[#13589a] text-xl text-white shadow-xl shadow-blue-950/25 transition hover:-translate-y-1 hover:shadow-2xl" aria-label="Mở chat hỗ trợ"><FaComments /></button>
    </div>
  );
}
