"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";
import { onAuthStateChanged, type User } from "firebase/auth";
import { FaArrowRotateLeft, FaPaperPlane, FaRobot, FaTrash, FaXmark } from "react-icons/fa6";
import { getFirebaseAuth } from "@/lib/firebase";
import { getApiBaseUrl } from "@/features/auth/utils";

type AiMessage = {
  id: string;
  role: "user" | "model";
  content: string;
  createdAt: string;
};

// Custom SVG icons for Gemini-style branding
const GeminiIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3c.13 0 .26.05.35.15.77 2.45 2.7 4.38 5.15 5.15.2.06.35.25.35.47 0 .22-.15.41-.35.47-2.45.77-4.38 2.7-5.15 5.15-.09.2-.28.35-.5.35-.22 0-.41-.15-.47-.35-.77-2.45-2.7-4.38-5.15-5.15-.2-.06-.35-.25-.35-.47 0-.22.15-.41.35-.47 2.45-.77 4.38-2.7 5.15-5.15.06-.2.25-.35.47-.35.02 0 .04 0 .06.01zm-5.5 12c.08 0 .15.03.2.09.43 1.37 1.5 2.44 2.87 2.87.11.03.2.14.2.26 0 .12-.09.23-.2.26-1.37.43-2.44 1.5-2.87 2.87-.03.11-.14.2-.26.2-.12 0-.23-.09-.26-.2-.43-1.37-1.5-2.44-2.87-2.87-.11-.03-.2-.14-.2-.26 0-.12.09-.23.2-.26 1.37-.43 2.44-1.5 2.87-2.87.03-.11.14-.2.26-.2z" />
  </svg>
);

const SparklesLoading = () => (
  <div className="flex items-center gap-1 py-1">
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-500 [animation-delay:-0.3s]" />
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-purple-500 [animation-delay:-0.15s]" />
    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-pink-500" />
  </div>
);

// Safe Regex Markdown Formatter
function formatMarkdown(text: string): string {
  if (!text) return "";

  // 1. Escape HTML
  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  // 2. Parse bold text **text** -> <strong>text</strong>
  html = html.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");

  // 3. Parse bullet points
  const lines = html.split("\n");
  let inList = false;
  const processedLines = lines.map((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      const content = trimmed.substring(2);
      let prefix = "";
      if (!inList) {
        inList = true;
        prefix = '<ul class="list-disc pl-5 my-1.5 space-y-1">';
      }
      return `${prefix}<li>${content}</li>`;
    } else {
      let suffix = "";
      if (inList) {
        inList = false;
        suffix = "</ul>";
      }
      return suffix + line;
    }
  });
  if (inList) {
    processedLines.push("</ul>");
  }
  html = processedLines.join("\n");

  // 4. Parse markdown links [text](url) -> <a href="url" class="...">text</a>
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, (match, linkText, url) => {
    const isSafe = url.startsWith("/") || url.startsWith("http://localhost") || url.startsWith("https://myshoes");
    if (isSafe) {
      return `<a href="${url}" class="text-indigo-600 hover:text-indigo-800 font-bold underline decoration-2 decoration-indigo-200 transition-colors">${linkText}</a>`;
    }
    return linkText;
  });

  return html;
}

export default function AiChatWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState("Đang trực tuyến");

  const messageListRef = useRef<HTMLDivElement | null>(null);

  const getWelcomeMessage = (): AiMessage => ({
    id: "welcome",
    role: "model",
    content: "Xin chào! Tôi là Trợ lý AI của Myshoes. Bạn có muốn tôi giúp tư vấn tìm một đôi giày phù hợp, chọn size hay giải đáp thắc mắc gì không? ✨",
    createdAt: new Date().toISOString()
  });

  // Track Auth state changes
  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) {
      setStatus("Firebase chưa được cấu hình.");
      return;
    }
    return onAuthStateChanged(auth, setUser);
  }, []);

  // Load chat history from localStorage when user logged in
  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    try {
      const saved = localStorage.getItem(`myshoes_ai_chat_history_${user.uid}`);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([getWelcomeMessage()]);
      }
    } catch (e) {
      console.error("Failed to load chat history", e);
      setMessages([getWelcomeMessage()]);
    }
  }, [user]);

  // Scroll to bottom when messages or open state changes
  useEffect(() => {
    if (open) {
      const messageList = messageListRef.current;
      messageList?.scrollTo({ top: messageList.scrollHeight, behavior: "smooth" });
    }
  }, [messages, open]);

  // Helper to save messages to localStorage
  const saveMessages = (updatedMessages: AiMessage[]) => {
    if (!user) return;
    try {
      localStorage.setItem(`myshoes_ai_chat_history_${user.uid}`, JSON.stringify(updatedMessages));
    } catch (e) {
      console.error("Failed to save chat history", e);
    }
  };

  // Submit message
  const submitMessage = async (contentToSend: string) => {
    if (!contentToSend.trim() || !user || loading) return;

    const userMsg: AiMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: contentToSend,
      createdAt: new Date().toISOString()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    saveMessages(newMessages);
    setDraft("");
    setLoading(true);
    setError(null);

    // Prepare API history format
    const historyPayload = newMessages
      .filter((m) => m.id !== "welcome")
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const token = await user.getIdToken();
      const response = await fetch(`${getApiBaseUrl()}/chat/ai-consult`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userMsg.content,
          history: historyPayload.slice(0, -1) // Excluding the last userMsg which is already in the main message parameter
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.message || "Không kết nối được với máy chủ AI.");
      }

      const modelMsg: AiMessage = {
        id: crypto.randomUUID(),
        role: "model",
        content: data.reply || "Xin lỗi, tôi không tìm thấy câu trả lời phù hợp.",
        createdAt: new Date().toISOString()
      };

      const updatedMessages = [...newMessages, modelMsg];
      setMessages(updatedMessages);
      saveMessages(updatedMessages);
    } catch (err) {
      console.error("AI consult error", err);
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitMessage(draft);
  };

  // Handle client-side routing on markdown links click
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest("a");
    if (anchor) {
      const href = anchor.getAttribute("href");
      if (href && href.startsWith("/")) {
        e.preventDefault();
        router.push(href);
        setOpen(false); // Optionally close chat when navigating
      }
    }
  };

  // Reset conversation
  const resetConversation = () => {
    if (!window.confirm("Đặt lại cuộc trò chuyện với AI? Lịch sử trò chuyện cũ sẽ bị xóa.")) return;
    const welcome = [getWelcomeMessage()];
    setMessages(welcome);
    saveMessages(welcome);
    setError(null);
  };

  return (
    <div className="fixed bottom-5 right-[88px] z-[70]">
      {open ? (
        <section className="mb-3 flex h-[min(610px,calc(100vh-105px))] w-[min(400px,calc(100vw-24px))] flex-col overflow-hidden rounded-[28px] border border-indigo-100 bg-white shadow-[0_24px_70px_rgba(79,70,229,0.18)]">
          {/* Header */}
          <header className="shrink-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 pb-4 pt-4 text-white">
            <div className="flex items-center gap-3">
              <div className="relative grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-white/15 text-lg ring-1 ring-white/20">
                <GeminiIcon className="h-6 w-6 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-indigo-600 bg-emerald-400 animate-pulse" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-[15px] font-bold">
                  Trợ lý AI Myshoes
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-[11px] text-white/80">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                  {status}
                </p>
              </div>
              {messages.length > 1 ? (
                <button
                  type="button"
                  onClick={resetConversation}
                  className="flex h-9 shrink-0 items-center justify-center rounded-full bg-white/10 px-3 text-[11px] font-bold text-white/90 ring-1 ring-white/15 transition hover:bg-white/25 hover:text-white"
                  title="Xóa lịch sử hội thoại"
                >
                  <FaTrash className="mr-1 h-3 w-3" /> Đặt lại
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white/80 transition hover:bg-white/20 hover:text-white"
                aria-label="Đóng chat AI"
              >
                <FaXmark />
              </button>
            </div>
          </header>

          {/* Chat Body */}
          {!user ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center bg-gradient-to-b from-indigo-50/20 to-white">
              <div className="mb-4 grid h-16 w-16 place-items-center rounded-3xl bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100">
                <GeminiIcon className="h-9 w-9 text-indigo-600" />
              </div>
              <p className="font-bold text-slate-900">Tính năng giới hạn khách hàng</p>
              <p className="mt-2 text-sm text-slate-500 leading-5">
                Vui lòng đăng nhập để trải nghiệm Trợ lý AI và nhận tư vấn sản phẩm tốt nhất.
              </p>
              <Link
                href="/login"
                className="mt-5 rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-indigo-700/30"
              >
                Đăng nhập ngay
              </Link>
            </div>
          ) : (
            <>
              <div
                ref={messageListRef}
                onClick={handleContentClick}
                className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain bg-slate-50/50 p-4"
              >
                {error ? (
                  <div className="mx-auto max-w-[92%] rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-center text-xs leading-5 text-rose-700">
                    {error}
                  </div>
                ) : null}

                {messages.map((message) => {
                  const isUser = message.role === "user";
                  return (
                    <div key={message.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-[13.5px] shadow-sm leading-6 transition-all ${
                          isUser
                            ? "rounded-br-sm bg-gradient-to-br from-indigo-600 to-indigo-700 text-white"
                            : "rounded-bl-sm border border-slate-100 bg-white text-slate-800"
                        }`}
                      >
                        {!isUser ? (
                          <p className="mb-1 text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                            <GeminiIcon className="h-3.5 w-3.5 text-indigo-500" /> AI Assistant
                          </p>
                        ) : null}
                        <div
                          className="prose prose-sm max-w-none break-words whitespace-pre-wrap"
                          dangerouslySetInnerHTML={{ __html: formatMarkdown(message.content) }}
                        />
                        <p className={`mt-1 text-[9px] text-right ${isUser ? "text-white/60" : "text-slate-400"}`}>
                          {new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Shimmer Response Wait */}
                {loading ? (
                  <div className="flex justify-start">
                    <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-4 py-3 text-sm shadow-sm">
                      <p className="mb-1 text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                        <GeminiIcon className="h-3.5 w-3.5 text-indigo-500" /> AI đang suy nghĩ...
                      </p>
                      <SparklesLoading />
                    </div>
                  </div>
                ) : null}

                {/* Suggestions triggers when only welcome message is present */}
                {messages.length === 1 && !loading ? (
                  <div className="pt-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                      Câu hỏi gợi ý
                    </p>
                    <div className="flex flex-col gap-2">
                      {[
                        "Tư vấn giày chạy bộ phù hợp",
                        "Tìm các mẫu giày Adidas",
                        "Hướng dẫn cách chọn size giày",
                        "Chính sách bảo hành và đổi trả"
                      ].map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => submitMessage(suggestion)}
                          className="w-full text-left rounded-2xl border border-slate-100 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-500 hover:text-indigo-600 hover:bg-indigo-50/10"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleFormSubmit} className="flex shrink-0 items-center gap-2 border-t border-slate-100 bg-white p-3.5">
                <div className="min-w-0 flex-1 rounded-full bg-slate-50 px-4 ring-1 ring-transparent transition focus-within:bg-white focus-within:ring-indigo-600/30">
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    maxLength={2000}
                    disabled={loading}
                    placeholder="Hỏi trợ lý AI của Myshoes..."
                    className="h-11 w-full bg-transparent text-[13.5px] text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!draft.trim() || loading}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/10 transition hover:-translate-y-0.5 hover:shadow-lg disabled:translate-y-0 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:from-slate-200 disabled:to-slate-200 disabled:text-slate-400 disabled:shadow-none"
                  aria-label="Gửi tin nhắn cho AI"
                >
                  <FaPaperPlane className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </section>
      ) : null}
      
      {/* Sparkly Floating Action Button */}
      <button
        suppressHydrationWarning
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="ml-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white shadow-xl shadow-indigo-600/20 transition hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/30"
        aria-label="Mở chat với AI"
      >
        <GeminiIcon className="h-6 w-6 text-white" />
      </button>
    </div>
  );
}
