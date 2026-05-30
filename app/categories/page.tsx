import type { Metadata } from "next";
import Link from "next/link";
import { FaChevronRight, FaPersonRunning, FaTableTennisPaddleBall, FaMountain, FaDumbbell, FaShoePrints, FaHeart } from "react-icons/fa6";
import { getAllProducts } from "@/lib/products";

export const metadata: Metadata = {
  title: "Danh mục sản phẩm | myshoes.vn",
  description: "Khám phá các dòng giày chạy bộ, thời trang, sân court, đường mòn, tập gym và casual chính hãng."
};

const CATEGORY_CARDS = [
  {
    key: "Running",
    name: "Giày Chạy Bộ (Running)",
    desc: "Đệm êm, nâng đỡ bàn chân tối đa và phản hồi lực tối ưu cho từng bước chạy của bạn.",
    icon: FaPersonRunning,
    gradient: "from-[#ff6b6b] to-[#ff8e53]",
    textColor: "text-[#ff6b6b]",
    bgColor: "bg-[#ff6b6b]/10",
  },
  {
    key: "Lifestyle",
    name: "Giày Thời Trang (Lifestyle)",
    desc: "Kiểu dáng streetwear trẻ trung, dễ phối đồ và mang lại sự tự tin cho các buổi dạo phố hàng ngày.",
    icon: FaHeart,
    gradient: "from-[#4facfe] to-[#00f2fe]",
    textColor: "text-[#00c6ff]",
    bgColor: "bg-[#00c6ff]/10",
  },
  {
    key: "Court",
    name: "Giày Sân Đấu (Court)",
    desc: "Đế bám cao cấp chống trượt, hỗ trợ các pha chuyển hướng nhanh khi chơi tennis, cầu lông, bóng rổ hoặc pickleball.",
    icon: FaTableTennisPaddleBall,
    gradient: "from-[#43e97b] to-[#38f9d7]",
    textColor: "text-[#2bcbba]",
    bgColor: "bg-[#2bcbba]/10",
  },
  {
    key: "Trail",
    name: "Giày Đường Mòn (Trail)",
    desc: "Đế gai bám đất vượt trội, chống thấm nhẹ và bảo vệ chân tối đa trên các cung đường địa hình gồ ghề.",
    icon: FaMountain,
    gradient: "from-[#f093fb] to-[#f5576c]",
    textColor: "text-[#e056fd]",
    bgColor: "bg-[#e056fd]/10",
  },
  {
    key: "Training",
    name: "Giày Luyện Tập (Training)",
    desc: "Gót bằng vững chãi, đệm đàn hồi cao, thiết kế đa năng hoàn hảo cho các bài tập gym, cardio hoặc nâng tạ nặng.",
    icon: FaDumbbell,
    gradient: "from-[#fa709a] to-[#fee140]",
    textColor: "text-[#ff4757]",
    bgColor: "bg-[#ff4757]/10",
  },
  {
    key: "Casual",
    name: "Giày Hằng Ngày (Casual)",
    desc: "Trọng lượng siêu nhẹ, chất liệu thông thoáng khí, dễ mang tháo, mang lại sự dễ chịu suốt cả ngày dài.",
    icon: FaShoePrints,
    gradient: "from-[#30cfd0] to-[#330867]",
    textColor: "text-[#0d3a6b]",
    bgColor: "bg-[#0d3a6b]/10",
  }
];

export default async function CategoriesPage() {
  const products = await getAllProducts();

  // Calculate product counts dynamically per category
  const categoryCounts = products.reduce<Record<string, number>>((acc, product) => {
    const cat = product.category;
    if (cat) {
      const normalized = cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
      acc[normalized] = (acc[normalized] || 0) + 1;
    }
    return acc;
  }, {});

  const totalCount = products.length;

  return (
    <main className="min-h-screen bg-[#f5f7fb] pb-24">
      {/* Page Header */}
      <section className="bg-gradient-to-br from-[#0d3a6b] via-[#114c8d] to-[#1e6ad1] text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Danh mục giày thể thao
            </h1>
            <p className="mt-4 text-base text-white/80 sm:text-lg">
              Phân loại giày chuyên nghiệp giúp bạn tìm kiếm chính xác đôi giày phù hợp với từng hoạt động thể thao và phong cách sống của riêng mình.
            </p>
            <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/90">
              <div className="rounded-full bg-white/10 px-4 py-2 font-medium">
                Tổng cộng: {totalCount} đôi giày
              </div>
              <div className="rounded-full bg-white/10 px-4 py-2 font-medium">
                {CATEGORY_CARDS.length} Danh mục chính
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <nav className="flex items-center gap-2 text-sm text-slate-500">
          <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Trang chủ</Link>
          <FaChevronRight className="text-xs" />
          <span className="text-slate-900 font-medium">Danh mục</span>
        </nav>
      </div>

      {/* Categories Grid */}
      <div className="mx-auto max-w-7xl px-4 mt-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORY_CARDS.map((card) => {
            const count = categoryCounts[card.key] || 0;
            return (
              <Link 
                key={card.key} 
                href={`/products?category=${card.key}`}
                className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-transparent flex flex-col justify-between min-h-[320px]"
              >
                {/* Visual gradient backdrop effect on hover */}
                <div className={`absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br ${card.gradient} opacity-0 transition-all duration-300 group-hover:scale-150 group-hover:opacity-10`} />

                <div>
                  <div className="flex items-center justify-between">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.bgColor} ${card.textColor} transition-transform duration-300 group-hover:scale-110`}>
                      <card.icon className="text-2xl" />
                    </div>
                    <span className="rounded-full bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-slate-600 group-hover:bg-[#0d3a6b] group-hover:text-white transition-colors duration-300">
                      {count} sản phẩm
                    </span>
                  </div>

                  <h3 className="mt-6 text-xl font-bold text-slate-900 group-hover:text-[#0d3a6b] transition-colors">
                    {card.name}
                  </h3>
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between text-sm font-bold text-[#0d3a6b]">
                  <span>Khám phá bộ sưu tập</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-50 group-hover:bg-[#0d3a6b] group-hover:text-white transition-all duration-300">
                    <FaChevronRight className="text-xs transition-transform duration-300 group-hover:translate-x-0.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
