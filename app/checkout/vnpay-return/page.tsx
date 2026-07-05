"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { FaCheck, FaCircleXmark, FaSpinner } from "react-icons/fa6";
import { getApiBaseUrl } from "@/features/auth/utils";
import { useCart } from "@/features/cart/CartContext";

type PaymentState = "checking" | "success" | "failed";

export default function VnpayReturnPage() {
  const [state, setState] = useState<PaymentState>("checking");
  const [message, setMessage] = useState("Đang xác minh kết quả thanh toán với VNPay...");
  const checkedRef = useRef(false);
  const { clearCart } = useCart();

  useEffect(() => {
    if (checkedRef.current) return;
    checkedRef.current = true;
    void (async () => {
      try {
        const response = await fetch(`${getApiBaseUrl()}/payments/vnpay/return${window.location.search}`);
        const result = await response.json().catch(() => null);
        if (response.ok && result?.valid && result?.success) {
          try {
            const raw = sessionStorage.getItem("myshoes_last_order");
            if (raw) sessionStorage.setItem("myshoes_last_order", JSON.stringify({ ...JSON.parse(raw), paymentStatus: "paid" }));
          } catch {
            // The payment result remains valid even when session storage is unavailable.
          }
          await clearCart();
          setState("success");
          setMessage("Thanh toán VNPay thành công. Đơn hàng của bạn đã được xác nhận.");
          return;
        }
        setState("failed");
        setMessage(result?.message || "Thanh toán không thành công hoặc đã bị hủy.");
      } catch {
        setState("failed");
        setMessage("Không thể xác minh giao dịch. Vui lòng kiểm tra lại đơn hàng hoặc liên hệ hỗ trợ.");
      }
    })();
  }, [clearCart]);

  return (
    <main className="flex min-h-[calc(100vh-178px)] items-center justify-center bg-[#f5f7fb] px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">
        <div className={`mx-auto grid h-20 w-20 place-items-center rounded-full text-3xl ${state === "checking" ? "bg-blue-50 text-[#0d3a6b]" : state === "success" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
          {state === "checking" ? <FaSpinner className="animate-spin" /> : state === "success" ? <FaCheck /> : <FaCircleXmark />}
        </div>
        <h1 className="!mb-0 !mt-6 !text-3xl !font-bold !leading-tight !tracking-normal text-slate-950">
          {state === "checking" ? "Đang xử lý thanh toán" : state === "success" ? "Thanh toán thành công" : "Thanh toán chưa thành công"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">{message}</p>
        {state !== "checking" ? (
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <Link href={state === "success" ? "/checkout/success" : "/checkout"} className="rounded-full bg-[#0d3a6b] px-5 py-3 text-sm font-bold !text-white">
              {state === "success" ? "Xem đơn hàng" : "Thử thanh toán lại"}
            </Link>
            <Link href="/" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600">Về trang chủ</Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}
