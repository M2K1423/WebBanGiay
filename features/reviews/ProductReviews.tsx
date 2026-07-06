"use client";

import { useEffect, useState } from "react";
import { FaStar, FaRegStar, FaStore } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";

type Review = {
  _id: string;
  userName: string;
  rating: number;
  comment: string;
  imageUrls: string[];
  isVerifiedPurchase: boolean;
  createdAt: string;
  adminReply?: string;
  adminReplyAt?: string;
};

type ProductReviewsProps = {
  productId: string;
};

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);

  const apiBaseUrl = getApiBaseUrl();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${apiBaseUrl}/reviews/product/${productId}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Failed to load reviews:", err);
      } finally {
        setLoading(false);
      }
    };
    void fetchReviews();
  }, [productId]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex text-amber-400 gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          i < rating ? <FaStar key={i} className="h-3.5 w-3.5" /> : <FaRegStar key={i} className="h-3.5 w-3.5 text-slate-200" />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center text-slate-400 shadow-sm">
        Đang tải đánh giá sản phẩm...
      </div>
    );
  }

  // Calculate stats
  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0 ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews) * 10) / 10 : 0;

  const starDistribution = [0, 0, 0, 0, 0]; // index 0 is 5 stars, index 4 is 1 star
  reviews.forEach(r => {
    const index = 5 - Math.max(1, Math.min(5, Math.floor(r.rating)));
    starDistribution[index]++;
  });

  return (
    <div className="mt-12 space-y-6">
      <div>
        <h3 className="text-xl font-bold text-slate-900">Đánh giá & Nhận xét</h3>
        <p className="text-xs text-slate-500 mt-1 font-medium">Nhận xét thực tế từ những khách hàng đã mua sản phẩm này.</p>
      </div>

      {totalReviews === 0 ? (
        <div className="rounded-2xl border border-slate-150 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-400 text-xl">
            💬
          </div>
          <p className="mt-3 text-sm font-semibold text-slate-700">Chưa có đánh giá nào</p>
          <p className="text-xs text-slate-400 mt-1">Hãy là người đầu tiên mua hàng và nhận xét về sản phẩm này!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Horizontal Aggregate Rating Box */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Left Part: Avg Rating */}
            <div className="flex flex-col items-center justify-center text-center px-6 md:border-r border-slate-100 shrink-0 w-full md:w-auto">
              <p className="text-5xl font-black text-slate-900">{averageRating}</p>
              <div className="mt-2 flex items-center justify-center">{renderStars(Math.round(averageRating))}</div>
              <p className="text-xs text-slate-400 mt-2 font-bold uppercase tracking-wider">({totalReviews} đánh giá)</p>
            </div>

            {/* Middle Part: Progress Bars */}
            <div className="flex-1 max-w-md w-full space-y-2">
              {starDistribution.map((count, index) => {
                const stars = 5 - index;
                const percentage = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                return (
                  <div key={stars} className="flex items-center gap-3 text-xs text-slate-500 font-semibold">
                    <span className="w-3 text-right">{stars}</span>
                    <FaStar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                    <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-8 text-right text-slate-400 font-bold">{percentage}%</span>
                  </div>
                );
              })}
            </div>

            {/* Right Part: Store Highlight */}
            <div className="hidden md:flex flex-col items-center justify-center text-center px-6 md:border-l border-slate-100 max-w-[200px] shrink-0">
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Trải nghiệm</p>
              <p className="text-sm text-[#0d3a6b] font-extrabold mt-1">Hài lòng tuyệt đối</p>
              <p className="text-[10px] text-slate-400 mt-1 font-semibold leading-relaxed">
                Đánh giá từ khách hàng đã mua và trải nghiệm thực tế.
              </p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4 min-w-0">
            {reviews.slice(0, visibleCount).map((review) => (
              <div key={review._id} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3.5 hover:shadow-md transition duration-300">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#0d3a6b]/10 to-[#0d3a6b]/5 text-[#0d3a6b] font-bold text-sm uppercase border border-[#0d3a6b]/10">
                      {review.userName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2">
                        <p className="text-sm font-extrabold text-slate-900">{review.userName}</p>
                        {review.isVerifiedPurchase && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Đã mua hàng
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        {renderStars(review.rating)}
                        <span className="text-[10px] text-slate-300">•</span>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {new Date(review.createdAt).toLocaleDateString("vi-VN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric"
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-slate-600 font-semibold leading-relaxed whitespace-pre-line">
                  {review.comment}
                </p>

                {review.imageUrls && review.imageUrls.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {review.imageUrls.map((url, i) => (
                      <img
                        key={i}
                        src={url}
                        alt="Ảnh khách hàng tải lên"
                        className="h-20 w-20 object-cover rounded-xl border border-slate-200 shadow-sm cursor-zoom-in transition hover:scale-105 hover:shadow-md duration-300"
                        onClick={() => window.open(url, "_blank")}
                      />
                    ))}
                  </div>
                )}

                {/* Admin Reply */}
                {review.adminReply && (
                  <div className="mt-4 bg-slate-50 border-l-4 border-[#0d3a6b] p-4 rounded-r-2xl space-y-1 ml-4 sm:ml-6">
                    <div className="flex items-center gap-2">
                      <FaStore className="text-xs text-[#0d3a6b]" />
                      <p className="text-xs font-bold text-[#0d3a6b]">Phản hồi từ Cửa hàng</p>
                      {review.adminReplyAt && (
                        <span className="text-[10px] text-slate-400 font-semibold ml-auto">
                          {new Date(review.adminReplyAt).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 font-semibold leading-relaxed whitespace-pre-line pt-1">
                      {review.adminReply}
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination Controls */}
            <div className="flex gap-3 pt-2">
              {reviews.length > visibleCount && (
                <button
                  onClick={() => setVisibleCount((prev) => prev + 5)}
                  className="flex-1 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-[#0d3a6b] hover:bg-[#0d3a6b]/5 transition-colors shadow-sm"
                >
                  Xem thêm nhận xét ({reviews.length - visibleCount})
                </button>
              )}
              {visibleCount > 3 && (
                <button
                  onClick={() => setVisibleCount(3)}
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Thu gọn
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
