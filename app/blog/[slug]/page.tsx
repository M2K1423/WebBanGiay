import { notFound } from "next/navigation";
import Link from "next/link";
import { FaChevronLeft, FaCalendar, FaClock, FaUser, FaChevronRight, FaBagShopping } from "react-icons/fa6";
import { STORIES } from "@/lib/stories";

export async function generateStaticParams() {
  return STORIES.map((story) => ({
    slug: story.slug,
  }));
}

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const story = STORIES.find((s) => s.slug === slug);

  if (!story) {
    notFound();
  }

  const relatedStories = STORIES.filter((s) => s.slug !== slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#f5f7fb] py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-[10px] sm:text-xs font-bold text-slate-400 mb-6 bg-white px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm w-fit">
          <Link href="/" className="hover:text-[#0d3a6b] transition-colors">Trang chủ</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-[#0d3a6b] transition-colors">Tin tức</Link>
          <span>/</span>
          <span className="text-slate-600 truncate max-w-[150px] sm:max-w-[250px]">{story.title}</span>
        </nav>

        {/* Main 2-Column Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr_320px] items-start">
          
          {/* Left Column: Main Article Card */}
          <div className="space-y-6">
            <article className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 sm:p-10 space-y-6">
              
              {/* Header Info */}
              <div className="space-y-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase text-[#0d3a6b] bg-[#0d3a6b]/5 border border-[#0d3a6b]/10">
                  {story.meta}
                </span>
                <h1 className="text-xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                  {story.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <FaUser className="text-[10px] text-slate-300" />
                    {story.author}
                  </span>
                  <span className="text-slate-200">•</span>
                  <span className="flex items-center gap-1.5">
                    <FaCalendar className="text-[10px] text-slate-300" />
                    {story.date}
                  </span>
                  <span className="text-slate-200">•</span>
                  <span className="flex items-center gap-1.5">
                    <FaClock className="text-[10px] text-slate-300" />
                    {story.readTime}
                  </span>
                </div>
              </div>

              {/* Banner Image */}
              <div className="relative h-60 sm:h-[350px] w-full rounded-2xl overflow-hidden bg-slate-100 shadow-sm">
                <img
                  src={story.image}
                  alt={story.title}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Content Body with customized HTML styles */}
              <div 
                className="text-slate-700 leading-relaxed font-semibold space-y-6 text-sm sm:text-base border-t border-slate-100 pt-6
                  [&_h2]:text-lg [&_h2]:sm:text-xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-8 [&_h2]:mb-4
                  [&_p]:text-slate-600 [&_p]:font-semibold [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2
                  [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2
                  [&_li]:text-slate-600 [&_li]:font-semibold
                  [&_strong]:font-extrabold [&_strong]:text-slate-900
                  [&_table]:border [&_table]:border-slate-200 [&_table_th]:bg-slate-50 [&_table_td]:border-b [&_table_td]:border-slate-100"
                dangerouslySetInnerHTML={{ __html: story.content }}
              />

              {/* Bottom Footer Back Button */}
              <div className="border-t border-slate-100 pt-6 flex justify-between items-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#0d3a6b] hover:text-[#0d3a6b]/80 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-2xl transition-colors shadow-sm bg-white"
                >
                  <FaChevronLeft className="text-[10px]" />
                  Quay lại trang chủ
                </Link>
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">
                  Mã bài viết: {story.slug}
                </span>
              </div>

            </article>
          </div>

          {/* Right Column: Sticky Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-24">
            
            {/* Widget 1: Related Articles */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b border-slate-100 pb-3">
                Bài viết liên quan
              </h3>
              <div className="space-y-4">
                {relatedStories.map((related) => (
                  <Link
                    key={related.slug}
                    href={`/blog/${related.slug}`}
                    className="group flex items-center gap-3.5 hover:bg-slate-50 p-2 rounded-xl transition-all duration-300 border border-transparent hover:border-slate-100"
                  >
                    <img
                      src={related.image}
                      alt={related.title}
                      className="h-14 w-14 object-cover rounded-xl border border-slate-100 shrink-0"
                    />
                    <div className="min-w-0 flex-1 space-y-1">
                      <span className="inline-block text-[8px] font-black uppercase text-[#0d3a6b] bg-[#0d3a6b]/5 border border-[#0d3a6b]/10 px-1.5 py-0.5 rounded">
                        {related.meta}
                      </span>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-1 group-hover:text-[#0d3a6b] transition-colors">
                        {related.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-bold">
                        {related.date}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Widget 2: Shop Promo Banner */}
            <div className="bg-gradient-to-br from-[#0d3a6b] to-[#072444] rounded-3xl p-6 text-white shadow-sm relative overflow-hidden space-y-4 border border-white/5">
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/5 blur-xl" />
              <div className="absolute -left-4 -top-4 h-20 w-20 rounded-full bg-white/5 blur-xl" />
              
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg border border-white/15">
                <FaBagShopping />
              </div>
              
              <div className="space-y-1">
                <h4 className="text-sm font-extrabold tracking-tight">Tìm đôi giày hoàn hảo?</h4>
                <p className="text-[10px] text-white/70 font-semibold leading-relaxed">
                  Khám phá bộ sưu tập giày thể thao và chạy bộ mới nhất với ưu đãi lên tới 50% cùng chế độ bảo hành 12 tháng.
                </p>
              </div>
              
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-1.5 w-full bg-white hover:bg-white/95 font-extrabold text-xs py-2.5 px-4 rounded-2xl transition-colors shadow-sm mt-2"
                style={{ color: "#0d3a6b" }}
              >
                Mua sắm ngay
                <FaChevronRight className="text-[9px]" style={{ color: "#0d3a6b" }} />
              </Link>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
