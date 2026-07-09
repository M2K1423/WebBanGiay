"use client";

import { useEffect, useState } from "react";
import { FaStar, FaCheck, FaEyeSlash, FaRegStar } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

type Review = {
  _id: string;
  productId: string;
  productName?: string;
  productImage?: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  isVerifiedPurchase: boolean;
  status: string;
  createdAt: string;
  adminReply?: string;
  adminReplyAt?: string;
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");

  const apiBaseUrl = getApiBaseUrl();

  const fetchReviews = async (token: string) => {
    setLoading(true);
    try {
      const headers: any = {
        "Authorization": `Bearer ${token}`
      };

      const response = await fetch(`${apiBaseUrl}/reviews/admin`, { headers });
      if (response.ok) {
        const data = await response.json();
        console.log("Reviews data loaded successfully:", data);
        setReviews(Array.isArray(data) ? data : []);
      } else {
        const errText = await response.text();
        console.error(`Failed to fetch reviews. Status: ${response.status}, Error: ${errText}`);
      }
    } catch (err) {
      console.error("Failed to fetch reviews with exception:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const auth = getFirebaseAuth();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) return;
      try {
        const token = await user.getIdToken();
        void fetchReviews(token);
      } catch (err) {
        console.error("Failed to get token:", err);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBaseUrl}/reviews/${id}/status`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setReviews(prev =>
          prev.map(r => (r._id === id ? { ...r, status: newStatus } : r))
        );
      } else {
        alert("Cập nhật trạng thái thất bại");
      }
    } catch {
      alert("Lỗi kết nối");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSendReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${apiBaseUrl}/reviews/${id}/reply`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ reply: replyText.trim() })
      });

      if (response.ok) {
        setReviews(prev =>
          prev.map(r => (r._id === id ? { ...r, adminReply: replyText.trim(), adminReplyAt: new Date().toISOString() } : r))
        );
        setReplyingId(null);
        setReplyText("");
      } else {
        alert("Gửi phản hồi thất bại");
      }
    } catch {
      alert("Lỗi kết nối");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-amber-400 gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          i < rating ? <FaStar key={i} className="h-3.5 w-3.5" /> : <FaRegStar key={i} className="h-3.5 w-3.5 text-slate-300" />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Quản lý Đánh Giá</h1>
        <p className="mt-1 text-sm text-slate-500">Phê duyệt hoặc ẩn các nhận xét, đánh giá từ khách hàng trên toàn hệ thống.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Khách hàng</th>
                <th className="px-6 py-4 font-semibold">Sản phẩm</th>
                <th className="px-6 py-4 font-semibold">Đánh giá</th>
                <th className="px-6 py-4 font-semibold">Nội dung nhận xét</th>
                <th className="px-6 py-4 font-semibold">Trạng thái</th>
                <th className="px-6 py-4 font-semibold text-center">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Đang tải danh sách đánh giá...
                  </td>
                </tr>
              ) : reviews.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                    Chưa có đánh giá nào trên hệ thống
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review._id} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <div>
                        <p className="font-semibold">{review.userName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{review.userId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {review.productImage ? (
                          <img
                            src={review.productImage}
                            alt={review.productName || review.productId}
                            className="h-10 w-10 object-cover rounded-lg bg-slate-100 border border-slate-200 shrink-0 mix-blend-multiply"
                          />
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-400 font-bold border border-slate-200 shrink-0">
                            👟
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-slate-900 line-clamp-1 max-w-[150px]">{review.productName || "Sản phẩm ẩn"}</p>
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{review.productId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {renderStars(review.rating)}
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                            Đã mua hàng
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <div>
                        <p className="text-slate-700 font-medium line-clamp-2">{review.comment}</p>
                        {review.imageUrls && review.imageUrls.length > 0 && (
                          <div className="flex gap-1.5 mt-2 overflow-x-auto">
                            {review.imageUrls.map((url, i) => (
                              <img
                                key={i}
                                src={url}
                                alt="Ảnh thực tế"
                                className="h-10 w-10 object-cover rounded-lg border border-slate-100 shrink-0"
                              />
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] text-slate-400 mt-1">
                          {new Date(review.createdAt).toLocaleString("vi-VN")}
                        </p>

                        {/* Admin reply section */}
                        {review.adminReply ? (
                          <div className="mt-2 bg-slate-50 border-l-2 border-[#0d3a6b] p-2 rounded-r text-xs">
                            <p className="font-bold text-[#0d3a6b]">Phản hồi của bạn:</p>
                            <p className="text-slate-600 mt-0.5">{review.adminReply}</p>
                            <button
                              onClick={() => {
                                setReplyingId(review._id);
                                setReplyText(review.adminReply || "");
                              }}
                              className="text-[10px] text-[#0d3a6b] hover:underline font-bold mt-1"
                            >
                              Chỉnh sửa
                            </button>
                          </div>
                        ) : replyingId === review._id ? (
                          <div className="mt-2 space-y-1.5">
                            <textarea
                              rows={2}
                              value={replyText}
                              onChange={e => setReplyText(e.target.value)}
                              placeholder="Nhập phản hồi..."
                              className="w-full rounded border border-slate-200 p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#0d3a6b] font-medium"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => void handleSendReply(review._id)}
                                className="bg-[#0d3a6b] hover:bg-[#0d3a6b]/95 text-white font-bold px-2 py-0.5 rounded text-[10px]"
                              >
                                Gửi
                              </button>
                              <button
                                onClick={() => {
                                  setReplyingId(null);
                                  setReplyText("");
                                }}
                                className="border border-slate-200 hover:bg-slate-50 text-slate-500 font-bold px-2 py-0.5 rounded text-[10px]"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingId(review._id);
                              setReplyText("");
                            }}
                            className="text-[10px] text-[#0d3a6b] border border-[#0d3a6b] hover:bg-[#0d3a6b]/5 font-bold px-2 py-0.5 rounded mt-2"
                          >
                            Phản hồi
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          review.status === "approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : review.status === "pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-200 animate-pulse"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {review.status === "approved"
                          ? "Đã duyệt"
                          : review.status === "pending"
                          ? "Chờ duyệt"
                          : "Đã ẩn"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          disabled={review.status === "approved" || updatingId === review._id}
                          onClick={() => void handleUpdateStatus(review._id, "approved")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-600 transition hover:bg-emerald-100 disabled:opacity-40 disabled:hover:bg-emerald-50"
                          title="Duyệt đánh giá"
                        >
                          <FaCheck className="h-4.5 w-4.5" />
                        </button>
                        <button
                          disabled={review.status === "rejected" || updatingId === review._id}
                          onClick={() => void handleUpdateStatus(review._id, "rejected")}
                          className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 border border-rose-100 text-rose-600 transition hover:bg-rose-100 disabled:opacity-40 disabled:hover:bg-rose-50"
                          title="Ẩn đánh giá"
                        >
                          <FaEyeSlash className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
