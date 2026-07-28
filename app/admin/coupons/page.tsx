"use client";

import { useEffect, useState } from "react";
import { FaTicket, FaPlus, FaTrashCan, FaCircleInfo, FaCalendarDays, FaCoins, FaUserCheck, FaPercent } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { getFirebaseAuth } from "@/lib/firebase";

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("fixed");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrderValue, setMinOrderValue] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [usageLimit, setUsageLimit] = useState("");

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: any = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`${getApiBaseUrl()}/coupons`, { headers });
      if (res.ok) {
        const data = await res.json();
        setCoupons(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Lỗi tải danh sách voucher:", err);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Set a default expiry date of 30 days from now
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 30);
    setExpiryDate(defaultDate.toISOString().split("T")[0]);
    void fetchCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const formattedCode = code.trim().toUpperCase();
    if (!formattedCode) {
      setFormError("Vui lòng nhập mã voucher.");
      return;
    }

    const valueNum = Number(discountValue);
    if (isNaN(valueNum) || valueNum <= 0) {
      setFormError("Giá trị giảm phải là số lớn hơn 0.");
      return;
    }

    if (discountType === "percentage" && valueNum > 100) {
      setFormError("Giá trị giảm theo phần trăm không được vượt quá 100%.");
      return;
    }

    setSubmitting(true);

    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: any = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const payload = {
        code: formattedCode,
        discountType,
        discountValue: valueNum,
        minOrderValue: Number(minOrderValue) || 0,
        maxDiscount: Number(maxDiscount) || 0,
        expiryDate: new Date(expiryDate).toISOString(),
        usageLimit: Number(usageLimit) || 100
      };

      const res = await fetch(`${getApiBaseUrl()}/coupons`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        setFormSuccess(`Đã tạo mã voucher ${formattedCode} thành công!`);
        setCode("");
        setDiscountValue("");
        setMinOrderValue("");
        setMaxDiscount("");
        // Reset to default date
        const defaultDate = new Date();
        defaultDate.setDate(defaultDate.getDate() + 30);
        setExpiryDate(defaultDate.toISOString().split("T")[0]);
        setUsageLimit("");
        await fetchCoupons();
      } else {
        const data = await res.json();
        setFormError(data.message || "Tạo mã giảm giá không thành công.");
      }
    } catch {
      setFormError("Không thể kết nối đến máy chủ.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCoupon = async (id: string, codeName: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa mã voucher ${codeName} không?`)) return;

    try {
      const auth = getFirebaseAuth();
      const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
      const headers: any = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${getApiBaseUrl()}/coupons/${id}`, {
        method: "DELETE",
        headers
      });

      if (res.ok) {
        alert(`Đã xóa mã ${codeName} thành công!`);
        await fetchCoupons();
      } else {
        alert("Xóa mã giảm giá thất bại.");
      }
    } catch {
      alert("Lỗi kết nối máy chủ khi xóa voucher.");
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + "đ";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <FaTicket className="text-rose-500" /> Quản lý Mã giảm giá (Vouchers)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tạo, quản lý và theo dõi hiệu suất của các mã voucher khuyến mãi trong cửa hàng.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {/* Create Voucher Form */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/50 h-fit">
          <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FaPlus className="text-[#0d3a6b]" /> Tạo Voucher mới
          </h2>

          <form onSubmit={handleCreateCoupon} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Mã Voucher *
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="E.g. SUMMER20, DISCOUNT50"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#0d3a6b] focus:outline-none uppercase font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Loại giảm *
                </label>
                <select
                  value={discountType}
                  onChange={(e) => setDiscountType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0d3a6b] focus:outline-none"
                >
                  <option value="fixed">Giảm tiền mặt (đ)</option>
                  <option value="percentage">Giảm theo %</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Giá trị giảm *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  placeholder={discountType === "percentage" ? "10%" : "50.000"}
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#0d3a6b] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Đơn tối thiểu áp dụng (đ)
              </label>
              <input
                type="number"
                min={0}
                value={minOrderValue}
                onChange={(e) => setMinOrderValue(e.target.value)}
                placeholder="E.g. 300000"
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#0d3a6b] focus:outline-none"
              />
            </div>

            {discountType === "percentage" && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Mức giảm tối đa (đ) (0 = Không giới hạn)
                </label>
                <input
                  type="number"
                  min={0}
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                  placeholder="E.g. 100000"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#0d3a6b] focus:outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Hạn sử dụng *
                </label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-[#0d3a6b] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                  Giới hạn lượt *
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={usageLimit}
                  onChange={(e) => setUsageLimit(e.target.value)}
                  placeholder="100"
                  className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-[#0d3a6b] focus:outline-none"
                />
              </div>
            </div>

            {formError && (
              <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                ⚠️ {formError}
              </div>
            )}

            {formSuccess && (
              <div className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-2.5">
                🎉 {formSuccess}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-full bg-[#0d3a6b] py-3 text-sm font-bold text-white hover:bg-[#0a2747] transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {submitting ? "Đang tạo..." : "Tạo Voucher"}
            </button>
          </form>
        </div>

        {/* Voucher Table */}
        <div className="rounded-3xl border border-slate-100 bg-white shadow-xl shadow-slate-200/50 overflow-hidden flex flex-col justify-between min-h-[500px]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4">Mã Voucher</th>
                  <th className="px-6 py-4">Loại giảm</th>
                  <th className="px-6 py-4">Đơn tối thiểu</th>
                  <th className="px-6 py-4">Lượt sử dụng</th>
                  <th className="px-6 py-4">Hạn dùng</th>
                  <th className="px-6 py-4 text-center">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-[#0d3a6b] mb-2"></div>
                      <p>Đang tải danh sách voucher...</p>
                    </td>
                  </tr>
                ) : coupons.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      <div className="text-4xl mb-2">🎟️</div>
                      <p>Chưa có mã giảm giá nào được tạo.</p>
                    </td>
                  </tr>
                ) : (
                  coupons.map((coupon) => {
                    const isExpired = new Date(coupon.expiryDate).getTime() < Date.now();
                    const isLimitReached = coupon.usedCount >= coupon.usageLimit;
                    const isActive = coupon.isActive && !isExpired && !isLimitReached;

                    return (
                      <tr key={coupon._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-slate-900">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
                            isActive ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "bg-slate-100 text-slate-400"
                          }`}>
                            <FaTicket className="text-[10px]" />
                            {coupon.code}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {coupon.discountType === "percentage" ? (
                            <span className="font-semibold text-emerald-600 flex items-center gap-1">
                              <FaPercent className="text-xs" /> Giảm {coupon.discountValue}%
                              {coupon.maxDiscount > 0 && (
                                <span className="text-[10px] text-slate-400 font-normal">
                                  (Tối đa {formatPrice(coupon.maxDiscount)})
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="font-semibold text-emerald-600 flex items-center gap-1">
                              <FaCoins className="text-xs" /> Giảm {formatPrice(coupon.discountValue)}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-700">
                          {coupon.minOrderValue > 0 ? formatPrice(coupon.minOrderValue) : "Không yêu cầu"}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1 w-24">
                            <div className="flex justify-between text-[10px] font-bold text-slate-500">
                              <span>Đã dùng {coupon.usedCount}</span>
                              <span>/{coupon.usageLimit}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#0d3a6b] rounded-full transition-all duration-300"
                                style={{ width: `${Math.min((coupon.usedCount / coupon.usageLimit) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                            isExpired ? "text-rose-600" : "text-slate-500"
                          }`}>
                            <FaCalendarDays className="text-[10px]" />
                            {new Date(coupon.expiryDate).toLocaleDateString("vi-VN")}
                            {isExpired && <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">Hết hạn</span>}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteCoupon(coupon._id, coupon.code)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-150 active:scale-90"
                            title="Xóa voucher"
                          >
                            <FaTrashCan className="text-sm" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Info */}
          <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <FaCircleInfo className="text-slate-400" />
            <span>Mã Voucher được áp dụng tự động bởi khách hàng ở trang thanh toán khi đơn hàng thỏa mãn các điều kiện cấu hình.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
