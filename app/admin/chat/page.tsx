"use client";

import { ChangeEvent, ClipboardEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { FaComments, FaImage, FaMagnifyingGlass, FaPaperPlane, FaXmark } from "react-icons/fa6";
import { getFirebaseAuth } from "@/lib/firebase";
import { getRealtimeBaseUrl, loadSocketFactory, type SocketClient } from "@/lib/socket-client";
import type { ChatConversation, ChatMessage } from "@/features/chat/types";
import { CHAT_IMAGE_ACCEPT, MAX_CHAT_IMAGE_SIZE, resolveChatImageUrl, uploadChatImage } from "@/features/chat/images";

function upsertConversation(current: ChatConversation[], incoming: ChatConversation) {
  return [incoming, ...current.filter((item) => item.id !== incoming.id)]
    .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
}

export default function AdminChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selected, setSelected] = useState<ChatConversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [search, setSearch] = useState("");
  const [, setStatus] = useState("Đang kết nối...");
  const [pendingImage, setPendingImage] = useState<File | null>(null);
  const [pendingImagePreview, setPendingImagePreview] = useState("");
  const [uploading, setUploading] = useState(false);
  const socketRef = useRef<SocketClient | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const messageListRef = useRef<HTMLDivElement | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;
    let cancelled = false;
    let unsubscribe = () => {};

    unsubscribe = onAuthStateChanged(auth, (user) => {
      socketRef.current?.disconnect();
      if (!user) {
        setStatus("Bạn chưa đăng nhập.");
        return;
      }
      void (async () => {
        try {
          const [factory, token] = await Promise.all([loadSocketFactory(), user.getIdToken()]);
          if (cancelled) return;
          const socket = factory(`${getRealtimeBaseUrl()}/chat`, {
            transports: ["websocket", "polling"], auth: { token }
          });
          socketRef.current = socket;
          socket.on("connect", () => {
            setStatus("Đang trực tuyến");
            socket.emit("conversation.list", {}, (items: ChatConversation[]) => {
              if (Array.isArray(items)) setConversations(items);
            });
          });
          socket.on("disconnect", () => setStatus("Mất kết nối, đang thử lại..."));
          socket.on("conversation.list", (items: ChatConversation[]) => setConversations(Array.isArray(items) ? items : []));
          socket.on("conversation.updated", (item: ChatConversation) => {
            setConversations((current) => upsertConversation(current, item));
            setSelected((current) => current?.id === item.id ? item : current);
          });
          socket.on("conversation.ended", (payload: { conversationId: string }) => {
            setConversations((current) => current.filter((item) => item.id !== payload.conversationId));
            if (selectedIdRef.current === payload.conversationId) {
              selectedIdRef.current = null;
              setSelected(null);
              setMessages([]);
            }
          });
          socket.on("message.history", (items: ChatMessage[]) => setMessages(Array.isArray(items) ? items : []));
          socket.on("message.created", (message: ChatMessage) => {
            if (message.conversationId !== selectedIdRef.current) return;
            setMessages((current) => current.some((item) => item.id === message.id) ? current : [...current, message]);
            socket.emit("chat.read", { conversationId: message.conversationId });
          });
          const showError = (error: { message?: string } | string) => setStatus(typeof error === "string" ? error : error?.message || "Chat gặp lỗi.");
          socket.on("chat.error", showError);
          socket.on("exception", showError);
        } catch (error) {
          if (!cancelled) setStatus(error instanceof Error ? error.message : "Không kết nối được chat.");
        }
      })();
    });

    return () => {
      cancelled = true;
      unsubscribe();
      socketRef.current?.disconnect();
    };
  }, []);

  useEffect(() => {
    const messageList = messageListRef.current;
    if (!messageList) return;
    messageList.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => () => {
    if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
  }, [pendingImagePreview]);

  const visibleConversations = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("vi");
    if (!query) return conversations;
    return conversations.filter((item) => `${item.customerName} ${item.customerEmail} ${item.lastMessage}`.toLocaleLowerCase("vi").includes(query));
  }, [conversations, search]);

  const openConversation = (conversation: ChatConversation) => {
    selectedIdRef.current = conversation.id;
    setSelected(conversation);
    setMessages([]);
    setPendingImage(null);
    setPendingImagePreview("");
    socketRef.current?.emit("conversation.open", { conversationId: conversation.id });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const content = draft.trim();
    if ((!content && !pendingImage) || !selected || !socketRef.current || uploading) return;
    setUploading(true);
    try {
      const imageUrl = pendingImage ? await uploadChatImage(pendingImage) : undefined;
      socketRef.current.emit("chat.send", { conversationId: selected.id, content, imageUrl });
      setDraft("");
      setPendingImage(null);
      setPendingImagePreview("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Không gửi được ảnh.");
    } finally {
      setUploading(false);
    }
  };

  const prepareImage = (file: File) => {
    if (!CHAT_IMAGE_ACCEPT.includes(file.type) || file.size > MAX_CHAT_IMAGE_SIZE) {
      setStatus(file.size > MAX_CHAT_IMAGE_SIZE ? "Ảnh không được lớn hơn 5 MB." : "Chỉ hỗ trợ JPG, PNG, WEBP và GIF.");
      return;
    }
    setPendingImage(file);
    setPendingImagePreview(URL.createObjectURL(file));
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
    if (!selected || !socketRef.current) return;
    if (!window.confirm(`Kết thúc trò chuyện với ${selected.customerName}? Toàn bộ tin nhắn sẽ bị xóa.`)) return;
    socketRef.current.emit("chat.end", { conversationId: selected.id });
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col gap-6 overflow-hidden">
      <div className="flex shrink-0 items-end justify-between gap-4">
        <h1 className="!m-0 !text-3xl !font-bold !leading-tight !tracking-tight text-slate-950">Tin nhắn khách hàng</h1>
      </div>

      <section className="grid min-h-0 flex-1 grid-cols-[330px_minmax(0,1fr)] grid-rows-[minmax(0,1fr)] overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <aside className="flex min-h-0 flex-col border-r border-slate-200">
          <div className="border-b border-slate-200 p-4">
            <div className="flex items-center gap-3 rounded-full bg-slate-100 px-4 py-2.5"><FaMagnifyingGlass className="text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm khách hàng..." className="min-w-0 flex-1 bg-transparent text-sm outline-none" /></div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-2">
            {visibleConversations.map((conversation) => (
              <button key={conversation.id} type="button" onClick={() => openConversation(conversation)} className={`mb-1 w-full rounded-2xl p-3 text-left transition ${selected?.id === conversation.id ? "bg-[#0d3a6b] text-white" : "hover:bg-slate-50"}`}>
                <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-bold">{conversation.customerName || "Khách hàng"}</p>{conversation.unreadForAdmin > 0 ? <span className="grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">{conversation.unreadForAdmin}</span> : null}</div>
                <p className={`mt-1 truncate text-xs ${selected?.id === conversation.id ? "text-white/65" : "text-slate-500"}`}>{conversation.lastMessage || conversation.customerEmail || "Cuộc trò chuyện mới"}</p>
                <p className={`mt-1 text-[10px] ${selected?.id === conversation.id ? "text-white/50" : "text-slate-400"}`}>{new Date(conversation.lastMessageAt).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
              </button>
            ))}
            {visibleConversations.length === 0 ? <p className="px-4 py-10 text-center text-sm text-slate-400">Chưa có cuộc trò chuyện.</p> : null}
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {selected ? (
            <>
              <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200 px-6 py-4">
                <div className="min-w-0"><p className="truncate font-bold text-slate-950">{selected.customerName}</p><p className="mt-0.5 truncate text-xs text-slate-500">{selected.customerEmail}</p></div>
                <button type="button" onClick={endConversation} className="flex shrink-0 items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"><FaXmark /> Kết thúc</button>
              </header>
              <div ref={messageListRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain bg-slate-50 p-6">
                {messages.map((message) => {
                  const mine = message.senderRole === "admin";
                  return <div key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}><div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${mine ? "rounded-br-md bg-[#0d3a6b] text-white" : "rounded-bl-md border border-slate-200 bg-white text-slate-800"}`}>{message.imageUrl ? <a href={resolveChatImageUrl(message.imageUrl)} target="_blank" rel="noreferrer"><img src={resolveChatImageUrl(message.imageUrl)} alt="Ảnh trong cuộc trò chuyện" className="mb-2 max-h-72 w-full rounded-xl object-cover" /></a> : null}{message.content ? <p className="whitespace-pre-wrap break-words">{message.content}</p> : null}<p className={`mt-1 text-[10px] ${mine ? "text-white/60" : "text-slate-400"}`}>{new Date(message.createdAt).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}</p></div></div>;
                })}
              </div>
              {pendingImagePreview ? <div className="flex shrink-0 items-center gap-3 border-t border-slate-200 bg-white px-4 pt-3"><img src={pendingImagePreview} alt="Ảnh chuẩn bị gửi" className="h-16 w-16 rounded-xl object-cover ring-1 ring-slate-200" /><p className="min-w-0 flex-1 truncate text-xs font-semibold text-slate-600">{pendingImage?.name}</p><button type="button" onClick={() => { setPendingImage(null); setPendingImagePreview(""); }} className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500" aria-label="Bỏ ảnh"><FaXmark /></button></div> : null}
              <form onSubmit={submit} className="flex gap-3 border-t border-slate-200 p-4"><input ref={imageInputRef} type="file" accept={CHAT_IMAGE_ACCEPT} onChange={selectImage} className="hidden" /><button type="button" onClick={() => imageInputRef.current?.click()} disabled={uploading} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-blue-50 hover:text-[#0d3a6b]" aria-label="Chọn ảnh"><FaImage /></button><input value={draft} onChange={(event) => setDraft(event.target.value)} onPaste={pasteImage} maxLength={2000} placeholder="Nhập câu trả lời hoặc Ctrl+V ảnh..." className="min-w-0 flex-1 rounded-full border border-slate-200 px-5 py-3 text-sm outline-none focus:border-[#0d3a6b]" /><button type="submit" disabled={(!draft.trim() && !pendingImage) || uploading} className="grid h-12 w-12 place-items-center rounded-full bg-[#0d3a6b] text-white disabled:opacity-40" aria-label="Gửi"><FaPaperPlane /></button></form>
            </>
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center text-center"><FaComments className="mb-4 text-5xl text-slate-300" /><p className="font-bold text-slate-700">Chọn một cuộc trò chuyện</p><p className="mt-1 text-sm text-slate-400">Tin nhắn mới sẽ xuất hiện ngay tại đây.</p></div>
          )}
        </div>
      </section>
    </div>
  );
}
