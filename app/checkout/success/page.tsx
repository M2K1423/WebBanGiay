import Link from "next/link";
import { FaCheck, FaBoxOpen } from "react-icons/fa6";

export default function CheckoutSuccessPage() {
  return (
    <main className="min-h-[calc(100vh-80px)] bg-[#f5f7fb] flex items-center justify-center py-16">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-8 text-center shadow-lg shadow-slate-200/50 sm:p-12 border border-slate-100">
          
          <div className="relative mb-8">
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20"></div>
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-xl shadow-emerald-500/30">
              <FaCheck className="text-4xl" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-4">Đặt hàng thành công!</h1>
          <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
            Cảm ơn bạn đã mua sắm tại <span className="font-semibold text-[#0d3a6b]">myshoes.vn</span>. Đơn hàng của bạn đã được ghi nhận và đang được xử lý.
          </p>

          <div className="mt-8 rounded-2xl bg-slate-50 w-full p-6 text-left border border-slate-100">
            <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <FaBoxOpen className="text-slate-400" /> Thông tin tiếp theo
            </h3>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0d3a6b]/10 text-[10px] font-bold text-[#0d3a6b]">1</span>
                Chúng tôi sẽ gọi điện xác nhận đơn hàng trong vòng 24h.
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0d3a6b]/10 text-[10px] font-bold text-[#0d3a6b]">2</span>
                Đơn hàng sẽ được giao đến bạn trong vòng 2-4 ngày làm việc.
              </li>
              <li className="flex gap-3">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0d3a6b]/10 text-[10px] font-bold text-[#0d3a6b]">3</span>
                Bạn có thể kiểm tra email để xem lại chi tiết đơn hàng.
              </li>
            </ul>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 w-full">
            <Link 
              href="/products" 
              className="flex-1 rounded-full bg-[#0d3a6b] py-4 text-sm font-semibold text-white shadow-lg shadow-[#0d3a6b]/20 transition-transform hover:-translate-y-0.5"
            >
              Tiếp tục mua sắm
            </Link>
            <Link 
              href="/" 
              className="flex-1 rounded-full bg-white border border-slate-200 py-4 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              Về trang chủ
            </Link>
          </div>

        </div>
      </div>
    </main>
  );
}
