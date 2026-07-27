"use client";

import { useState } from "react";
import Link from "next/link";
import { FaChevronRight, FaNewspaper, FaBookOpen, FaLightbulb, FaMagnifyingGlass } from "react-icons/fa6";
import { STORIES } from "@/lib/stories";

export default function BlogListPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const tags = ["All", "Guide", "News", "Blog"];

  // Filter stories based on query and tag
  const filteredStories = STORIES.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          story.desc.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag === "All" || story.meta.toLowerCase() === selectedTag.toLowerCase();
    return matchesSearch && matchesTag;
  });

  const getTagIcon = (tag: string) => {
    switch (tag.toLowerCase()) {
      case "guide":
        return <FaLightbulb className="text-amber-500" />;
      case "news":
        return <FaNewspaper className="text-blue-500" />;
      case "blog":
        return <FaBookOpen className="text-emerald-500" />;
      default:
        return null;
    }
  };

  return (
    <main className="min-h-screen bg-[#f5f7fb] py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#0d3a6b] bg-[#0d3a6b]/5 border border-[#0d3a6b]/10 uppercase tracking-wide">
            Cẩm nang & Xu hướng
          </span>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
            Latest Stories
          </h1>
          <p className="text-sm text-slate-500 font-semibold leading-relaxed">
            Khám phá xu hướng giày chạy bộ mới nhất, mẹo chọn size chuẩn xác và cẩm nang bảo quản giày bền đẹp từ các chuyên gia của chúng tôi.
          </p>
        </div>

        {/* Search and Filters Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-3xl border border-slate-200/80 shadow-sm">
          {/* Tag filters */}
          <div className="flex gap-2 flex-wrap">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-300 ${
                  selectedTag === tag
                    ? "bg-[#0d3a6b] text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                }`}
              >
                {tag === "All" ? "Tất cả" : tag}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-72">
            <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              placeholder="Tìm kiếm bài viết..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0d3a6b]/20 focus:border-[#0d3a6b] bg-slate-50/50"
            />
          </div>
        </div>

        {/* Stories Grid */}
        {filteredStories.length === 0 ? (
          <div className="text-center bg-white border border-slate-200 rounded-3xl p-16 shadow-sm max-w-md mx-auto">
            <p className="text-sm font-semibold text-slate-700">Không tìm thấy bài viết nào</p>
            <p className="text-xs text-slate-400 mt-1">Vui lòng thử từ khóa tìm kiếm khác hoặc đổi bộ lọc.</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {filteredStories.map(story => (
              <Link
                key={story.slug}
                href={`/blog/${story.slug}`}
                className="group flex flex-col bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Banner Image */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={story.image}
                    alt={story.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase text-slate-900 bg-white/95 shadow-sm border border-slate-100">
                    {getTagIcon(story.meta)}
                    {story.meta}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                      <span>{story.date}</span>
                      <span>•</span>
                      <span>{story.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-[#0d3a6b] transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-3">
                      {story.desc}
                    </p>
                  </div>

                  <div className="pt-6 flex items-center justify-between border-t border-slate-100 mt-6">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide">
                      By {story.author}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-[#0d3a6b] group-hover:underline">
                      Đọc tiếp
                      <FaChevronRight className="text-[10px]" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
