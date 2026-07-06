"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FaTableCells, FaList } from "react-icons/fa6";

interface SortSelectProps {
  currentSort: string;
}

export default function SortSelect({ currentSort }: SortSelectProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const currentView = searchParams.get("view") || "grid";

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    const params = new URLSearchParams(searchParams.toString());
    
    if (value) {
      params.set("sort", value);
    } else {
      params.delete("sort");
    }
    
    // Reset page to 1 when changing sort order
    params.delete("page");
    
    router.push(`/products?${params.toString()}`);
  };

  const handleViewChange = (view: "grid" | "list") => {
    const params = new URLSearchParams(searchParams.toString());
    if (view === "list") {
      params.set("view", "list");
    } else {
      params.delete("view");
    }
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="flex items-center gap-4">
      {/* View Toggle Buttons */}
      <div className="flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-sm gap-1">
        <button
          type="button"
          onClick={() => handleViewChange("grid")}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
            currentView === "grid"
              ? "bg-[#0d3a6b] text-white"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
          title="Grid view"
        >
          <FaTableCells className="text-sm" />
        </button>
        <button
          type="button"
          onClick={() => handleViewChange("list")}
          className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all cursor-pointer ${
            currentView === "list"
              ? "bg-[#0d3a6b] text-white"
              : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
          }`}
          title="List view"
        >
          <FaList className="text-sm" />
        </button>
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-slate-500 font-medium hidden sm:block">Sort by:</span>
        <select
          value={currentSort}
          onChange={handleSortChange}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm focus:border-[#0d3a6b] focus:outline-none cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <option value="">Newest</option>
          <option value="price-asc">Price ↑</option>
          <option value="price-desc">Price ↓</option>
          <option value="rating">Rating</option>
          <option value="sold">Best Sellers</option>
          <option value="discount">Best Sale</option>
        </select>
      </div>
    </div>
  );
}
