"use client";

import { useState } from "react";
import { FaStar, FaRegStar, FaXmark } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";

type WriteReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  onSuccess: () => void;
};

export default function WriteReviewModal({
  isOpen,
  onClose,
  productId,
  productName,
  onSuccess
}: WriteReviewModalProps) {
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [imageUrls, setImageUrls] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim().length < 10) {
      setError("Nội dung nhận xét phải dài tối thiểu 10 ký tự.");
      return;
    }
    setError("");
    setSubmitting(true);

    const images = imageUrls
      .split(/[,\n]/)
      .map(url => url.trim())
      .filter(Boolean);

    const payload = {
      productId,
      rating,
      comment: comment.trim(),
      imageUrls: images
    };

    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: any = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${getApiBaseUrl()}/reviews`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => null);

      if (response.ok) {
        setComment("");
        setImageUrls("");
        setRating(5);
        onSuccess();
        onClose();
      } else {
        setError(data?.message || "Gửi đánh giá thất bại.");
      }
    } catch {
      setError("Lỗi kết nối đến máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl transition-all">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <div>
            <h3 className="text-lg font-bold text-slate-950">Đánh giá sản phẩm</h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5 line-clamp-1">{productName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <FaXmark className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Star selector */}
          <div className="flex flex-col items-center justify-center gap-2">
            <label className="text-sm font-semibold text-slate-700">Chất lượng sản phẩm</label>
            <div className="flex text-amber-400 gap-1">
              {Array.from({ length: 5 }).map((_, idx) => {
                const starVal = idx + 1;
                const isStarred = hoverRating !== null ? starVal <= hoverRating : starVal <= rating;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoverRating(starVal)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                  >
                    {isStarred ? (
                      <FaStar className="h-9 w-9 cursor-pointer" />
                    ) : (
                      <FaRegStar className="h-9 w-9 cursor-pointer text-slate-300" />
                    )}
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-[#0d3a6b] bg-[#0d3a6b]/5 px-2 py-0.5 rounded-full mt-1">
              {rating === 5 ? "Tuyệt vời" : rating === 4 ? "Hài lòng" : rating === 3 ? "Bình thường" : rating === 2 ? "Không hài lòng" : "Tệ"}
            </span>
          </div>

          {/* Comment */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nhận xét chi tiết *</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm này (size giày thế nào, chất liệu, đi êm chân không...)"
              className="w-full rounded-2xl border border-slate-200 p-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b] placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Image URLs */}
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Link hình ảnh (Không bắt buộc)</label>
            <input
              type="text"
              value={imageUrls}
              onChange={e => setImageUrls(e.target.value)}
              placeholder="Dán link ảnh cách nhau bằng dấu phẩy"
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:border-[#0d3a6b] focus:outline-none focus:ring-1 focus:ring-[#0d3a6b] placeholder:text-slate-400 font-medium"
            />
          </div>

          {error && (
            <div className="text-sm font-bold text-rose-500 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-full border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-full bg-[#0d3a6b] py-3 text-sm font-bold text-white shadow-lg shadow-[#0d3a6b]/20 transition hover:bg-[#0a2747] disabled:opacity-50 disabled:shadow-none"
            >
              {submitting ? "Đang gửi..." : "Gửi đánh giá"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
