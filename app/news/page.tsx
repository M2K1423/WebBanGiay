"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  FaNewspaper, 
  FaCalendarDays, 
  FaClock, 
  FaArrowRight, 
  FaEnvelope, 
  FaBookmark,
  FaShareNodes,
  FaChevronRight,
  FaEye,
  FaMagnifyingGlass
} from "react-icons/fa6";

// Static mock news data
const ARTICLES = [
  {
    id: "nike-air-max-2026",
    title: "Nike Air Max 2026: Bước Đột Phá Mới Trong Công Nghệ Đệm Khí",
    slug: "nike-air-max-2026-cong-nghe-moi",
    category: "technology",
    categoryLabel: "Tin Công Nghệ",
    summary: "Nike vừa chính thức hé lộ thế hệ đệm khí Air Max tiếp theo với cấu trúc lưới 3D cải tiến, mang lại độ êm ái và phản hồi lực vượt trội chưa từng có.",
    content: "Chi tiết bài viết...",
    imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200",
    date: "07/07/2026",
    readTime: "5 phút đọc",
    author: "Phan Phát",
    views: "1.2k",
    isFeatured: true,
    tag: "NỔI BẬT"
  },
  {
    id: "sneaker-trend-2026",
    title: "Xu Hướng Sneaker Mùa Hè 2026: Tối Giản Hay Retro Lên Ngôi?",
    slug: "xu-huong-sneaker-mua-he-2026",
    category: "trends",
    categoryLabel: "Xu Hướng",
    summary: "Sự trỗi dậy của các dòng giày chạy bộ cổ điển thập niên 90 đang định hình phong cách thời trang đường phố trong mùa hè năm nay.",
    imageUrl: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800",
    date: "06/07/2026",
    readTime: "4 phút đọc",
    author: "Duy Phong",
    views: "850",
    isFeatured: false,
    tag: "XU HƯỚNG"
  },
  {
    id: "how-to-clean-sneakers",
    title: "Hướng Dẫn Vệ Sinh Giày Sneaker Trắng Đúng Cách Tại Nhà",
    slug: "huong-dan-ve-sinh-giay-sneaker-trang",
    category: "guides",
    categoryLabel: "Mẹo & Hướng Dẫn",
    summary: "Giữ cho đôi giày trắng của bạn luôn như mới với 5 bước vệ sinh đơn giản bằng các nguyên liệu dễ kiếm ngay tại nhà.",
    imageUrl: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800",
    date: "05/07/2026",
    readTime: "6 phút đọc",
    author: "Solelane Lab",
    views: "2.4k",
    isFeatured: false,
    tag: "HỮU ÍCH"
  },
  {
    id: "adidas-primeknit-future",
    title: "Adidas Ra Mắt Dòng Giày Chạy Làm Từ Rác Thải Đại Dương Cải Tiến",
    slug: "adidas-primeknit-future-rac-thai-dai-duong",
    category: "technology",
    categoryLabel: "Tin Công Nghệ",
    summary: "Phiên bản Primeknit mới sử dụng 100% sợi dệt tái chế có độ bền tăng gấp đôi, đánh dấu bước tiến lớn trong nỗ lực bảo vệ môi trường.",
    imageUrl: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800",
    date: "03/07/2026",
    readTime: "4 phút đọc",
    author: "Hải Nam",
    views: "940",
    isFeatured: false,
    tag: "MÔI TRƯỜNG"
  },
  {
    id: "jordan-retro-hype",
    title: "Air Jordan 1 Retro High OG 'Chicago' Rục Rịch Trở Lại Vào Cuối Năm",
    slug: "air-jordan-1-retro-high-og-chicago-tro-lai",
    category: "collections",
    categoryLabel: "Bộ Sưu Tập",
    summary: "Các nguồn tin uy tín xác nhận phối màu huyền thoại Chicago sẽ tái xuất với chất liệu da cao cấp được phục dựng nguyên bản 1985.",
    imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=800",
    date: "01/07/2026",
    readTime: "3 phút đọc",
    author: "Minh Quân",
    views: "3.1k",
    isFeatured: false,
    tag: "HOT"
  },
  {
    id: "select-size-online",
    title: "Mẹo Đo Size Giày Chuẩn Xác Đến 99% Khi Mua Hàng Online",
    slug: "meo-do-size-giay-chuan-xac-khi-mua-online",
    category: "guides",
    categoryLabel: "Mẹo & Hướng Dẫn",
    summary: "Tránh việc đổi trả mất thời gian bằng phương pháp đo kích thước bàn chân cực chuẩn theo chuẩn Nhật Bản và Châu Âu.",
    imageUrl: "https://images.unsplash.com/photo-1491553895911-0055eca6402d?q=80&w=800",
    date: "28/06/2026",
    readTime: "5 phút đọc",
    author: "Solelane Care",
    views: "1.7k",
    isFeatured: false,
    tag: "CẨM NANG"
  },
  {
    id: "hypebeast-sneakers-value",
    title: "Tại Sao Sneaker Trở Thành Kênh Đầu Tư Sinh Lời Hơn Cả Vàng?",
    slug: "tai-sao-sneaker-tro-thanh-kenh-dau-tu-sinh-loi",
    category: "trends",
    categoryLabel: "Xu Hướng",
    summary: "Phân tích thị trường resell sneaker năm qua và lý do những đôi giày giới hạn tiếp tục tăng giá phi mã bất chấp biến động kinh tế.",
    imageUrl: "https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?q=80&w=800",
    date: "25/06/2026",
    readTime: "7 phút đọc",
    author: "Khánh Linh",
    views: "4.2k",
    isFeatured: false,
    tag: "PHÂN TÍCH"
  }
];

const CATEGORIES = [
  { value: "all", label: "Tất cả tin tức" },
  { value: "technology", label: "Công Nghệ Giày" },
  { value: "trends", label: "Xu Hướng & Phong Cách" },
  { value: "collections", label: "Bộ Sưu Tập Mới" },
  { value: "guides", label: "Cẩm Nang & Mẹo" }
];

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribedEmail, setSubscribedEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Filter articles based on category and search query
  const filteredArticles = ARTICLES.filter(article => {
    const matchesCategory = activeCategory === "all" || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const featuredArticle = ARTICLES.find(a => a.isFeatured);
  const regularArticles = filteredArticles.filter(a => !a.isFeatured);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribedEmail.trim()) {
      setIsSubscribed(true);
      setSubscribedEmail("");
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  return (
    <main className="min-h-screen bg-[#f8fafc] text-slate-800">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-sm text-slate-500 font-semibold">
            <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Trang chủ</Link>
            <FaChevronRight className="text-[10px]" />
            <span className="text-slate-900 font-bold">Tin tức Sneaker</span>
          </nav>
        </div>
      </div>

      {/* Header Title Section */}
      <div className="mx-auto max-w-7xl px-4 pt-10 pb-6 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-200/60 pb-8">
          <div>
            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-widest text-[#0d3a6b] mb-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0d3a6b]/10">
                <FaNewspaper className="text-xs text-[#0d3a6b]" />
              </span>
              <span>Blog & Tin tức</span>
            </div>
            <h1 className="text-3xl font-black uppercase tracking-wider text-slate-900 leading-tight sm:text-4xl">
              Thế Giới Sneaker
            </h1>
            <p className="mt-2 text-sm text-slate-500 font-medium max-w-xl">
              Cập nhật những xu hướng mới nhất, công nghệ giày hiện đại, thông tin ra mắt sản phẩm giới hạn và cẩm nang bảo quản giày hữu ích.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full max-w-xs shrink-0">
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 py-2.5 text-sm font-semibold outline-none focus:border-[#0d3a6b] focus:ring-2 focus:ring-[#0d3a6b]/10 transition-all placeholder:text-slate-400"
            />
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Featured Article - Show only if matches search or no search */}
        {featuredArticle && (!searchQuery || featuredArticle.title.toLowerCase().includes(searchQuery.toLowerCase())) && (
          <div className="mb-12">
            <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Bài viết nổi bật</h2>
            <div className="group relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-lg grid lg:grid-cols-[5.5fr_4.5fr]">
              {/* Featured Image */}
              <div className="relative h-64 sm:h-96 lg:h-full min-h-[320px] overflow-hidden bg-slate-100">
                <img
                  src={featuredArticle.imageUrl}
                  alt={featuredArticle.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 via-transparent to-transparent"></div>
                <span className="absolute left-6 top-6 rounded-full bg-[#0d3a6b] px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  {featuredArticle.tag}
                </span>
              </div>

              {/* Featured content */}
              <div className="flex flex-col justify-between p-6 sm:p-10 lg:p-12">
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-3.5 text-xs font-bold text-slate-400">
                    <span className="rounded-full bg-slate-100 px-3.5 py-1 text-slate-600 font-bold uppercase tracking-wider">
                      {featuredArticle.categoryLabel}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaCalendarDays className="text-slate-400" />
                      {featuredArticle.date}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FaClock className="text-slate-400" />
                      {featuredArticle.readTime}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 leading-snug group-hover:text-[#0d3a6b] transition-colors md:text-2xl">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-sm font-medium text-slate-500 leading-relaxed">
                    {featuredArticle.summary}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-6">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0d3a6b] font-bold text-white text-sm uppercase">
                      {featuredArticle.author.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{featuredArticle.author}</p>
                      <p className="text-xs text-slate-400 font-semibold">Tác giả</p>
                    </div>
                  </div>

                  <Link 
                    href={`/news/${featuredArticle.id}`}
                    className="flex items-center gap-2 rounded-2xl bg-[#0d3a6b] px-5 py-3 text-sm font-bold uppercase tracking-wider !text-white hover:!text-white shadow-md transition-all hover:bg-[#0a2747] hover:translate-x-1"
                  >
                    <span className="!text-white">Đọc chi tiết</span>
                    <FaArrowRight className="text-xs !text-white" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filter Categories Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
          <div className="flex flex-wrap gap-2.5">
            {CATEGORIES.map((cat) => {
              const isActive = cat.value === activeCategory;
              return (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setActiveCategory(cat.value)}
                  className={`rounded-2xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    isActive
                      ? "bg-[#0d3a6b] text-white shadow-md shadow-[#0d3a6b]/10"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300 hover:text-slate-700"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
            Tìm thấy {filteredArticles.length} bài viết
          </div>
        </div>

        {/* Article Grid */}
        {filteredArticles.length > 0 ? (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {regularArticles.map((article) => (
              <article 
                key={article.id}
                className="group flex flex-col justify-between overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1"
              >
                <div>
                  {/* Article Thumbnail */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-50">
                    <img
                      src={article.imageUrl}
                      alt={article.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent"></div>
                    <span className="absolute left-5 top-5 rounded-full bg-white/95 backdrop-blur-md px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#0d3a6b] shadow-sm">
                      {article.tag}
                    </span>
                  </div>

                  {/* Article details */}
                  <div className="p-6">
                    <div className="flex items-center gap-3.5 text-[11px] font-bold text-slate-400 mb-3">
                      <span className="text-[#0d3a6b] font-extrabold uppercase">
                        {article.categoryLabel}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <FaCalendarDays />
                        {article.date}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#0d3a6b] transition-colors">
                      <Link href={`/news/${article.id}`}>{article.title}</Link>
                    </h3>
                    <p className="mt-2.5 text-xs sm:text-sm text-slate-500 font-medium leading-relaxed line-clamp-3">
                      {article.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 p-6 pt-4 mt-auto">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <FaClock className="text-slate-400" />
                    <span>{article.readTime}</span>
                    <span className="px-1 text-slate-300">·</span>
                    <FaEye className="text-slate-400" />
                    <span>{article.views} lượt xem</span>
                  </div>
                  <Link 
                    href={`/news/${article.id}`} 
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 !text-slate-600 transition-all hover:bg-[#0d3a6b] hover:!text-white group"
                    aria-label={`Đọc bài viết: ${article.title}`}
                  >
                    <FaArrowRight className="text-xs !text-slate-600 group-hover:!text-white transition-colors" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white border border-slate-100 py-16 px-4 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-50 text-[#0d3a6b]">
              <FaNewspaper className="text-2xl" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Không tìm thấy bài viết nào</h3>
            <p className="mt-1 text-sm text-slate-500 font-medium">
              Vui lòng thử tìm kiếm bằng từ khoá khác hoặc đổi danh mục tin tức.
            </p>
          </div>
        )}

        {/* Sneaker Care Tips Section */}
        <section className="mt-20 rounded-3xl bg-[#0d3a6b] text-white overflow-hidden relative shadow-lg">
          <div className="absolute right-0 top-0 bottom-0 w-1/3 hidden lg:block opacity-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800')" }}></div>
          <div className="relative z-10 p-8 sm:p-12 lg:max-w-2xl">
            <span className="rounded-full bg-white/10 backdrop-blur-md px-4 py-1 text-xs font-bold uppercase tracking-wider text-amber-300">
              💡 Kiến thức hữu ích
            </span>
            <h2 className="mt-4 text-2xl font-black uppercase tracking-wider md:text-3xl">
              Cẩm Nang Chăm Sóc & Bảo Quản Sneaker Của Bạn
            </h2>
            <p className="mt-3 text-sm font-medium text-white/80 leading-relaxed">
              Bạn có biết cách giữ giày không bị ố vàng hay cách bảo quản da lộn vào mùa mưa? Đội ngũ chuyên gia từ Solelane Shoes đã biên soạn trọn bộ cẩm nang hướng dẫn chi tiết dành riêng cho bạn.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/news/how-to-clean-sneakers"
                className="rounded-2xl bg-white px-6 py-3.5 text-xs font-black uppercase tracking-widest !text-[#0d3a6b] hover:!text-[#0d3a6b] shadow-md hover:bg-slate-50 transition-all hover:scale-102"
              >
                Xem cẩm nang vệ sinh
              </Link>
              <Link
                href="/news/select-size-online"
                className="rounded-2xl border-2 border-white/20 px-6 py-3 text-xs font-black uppercase tracking-widest !text-white hover:!text-white hover:bg-white/10 transition-all"
              >
                Mẹo đo size giày
              </Link>
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="mt-20 max-w-4xl mx-auto rounded-3xl bg-white border border-slate-100 p-8 sm:p-12 text-center shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-rose-500"></div>
          <div className="max-w-xl mx-auto space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#0d3a6b]/5 text-[#0d3a6b]">
              <FaEnvelope className="text-xl" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-slate-900">Đăng Ký Nhận Bản Tin</h2>
            <p className="text-sm text-slate-500 font-medium">
              Nhận thông báo sớm nhất về các đợt phát hành giày giới hạn, ưu đãi độc quyền và các bài viết cẩm nang sneaker hàng tuần.
            </p>

            <form onSubmit={handleSubscribe} className="mt-8 flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Nhập địa chỉ email của bạn..."
                required
                value={subscribedEmail}
                onChange={(e) => setSubscribedEmail(e.target.value)}
                className="w-full flex-1 rounded-2xl border border-slate-200 bg-slate-50/50 px-5 py-3 text-sm font-semibold outline-none focus:border-[#0d3a6b] focus:bg-white transition-all"
              />
              <button
                type="submit"
                className="rounded-2xl bg-[#0d3a6b] px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white hover:bg-[#0a2747] transition-all shrink-0 shadow-md"
              >
                Đăng ký ngay
              </button>
            </form>

            {isSubscribed && (
              <p className="mt-4 text-sm font-semibold text-emerald-600 animate-fade-in">
                🎉 Cảm ơn bạn! Bạn đã đăng ký nhận bản tin thành công.
              </p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
