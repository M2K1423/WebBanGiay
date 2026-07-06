"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FaChevronLeft, FaChevronRight, FaStar } from "react-icons/fa6";
import { FeaturedProduct, getProductImage } from "@/lib/products";

interface FlashSaleCarouselProps {
  products: FeaturedProduct[];
}

export default function FlashSaleCarousel({ products }: FlashSaleCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(true);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Duplicate products to make the auto-scroll look continuous and seamless
  const displayProducts = [...products, ...products, ...products];

  const cardWidthWithGap = 304; // width of card (280px) + gap (24px)

  // Custom snappy smooth scroll using requestAnimationFrame
  const animateScroll = (element: HTMLDivElement, target: number, duration: number) => {
    const start = element.scrollLeft;
    const change = target - start;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Cubic ease-out curve (fast start, slow deceleration)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      element.scrollLeft = start + change * easeProgress;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Start in the middle set of products for a seamless infinite scroll experience
    const initializeScroll = () => {
      const maxScroll = container.scrollWidth / 3;
      // Align perfectly to a card boundary
      const snappedMiddle = Math.round(maxScroll / cardWidthWithGap) * cardWidthWithGap;
      container.scrollLeft = snappedMiddle;
    };

    const timer = setTimeout(initializeScroll, 100);

    let intervalId: any;
    const speed = 1; // pixels per step

    const startAutoScroll = () => {
      intervalId = setInterval(() => {
        if (!container) return;
        
        const maxScroll = container.scrollWidth / 3;
        const snappedMax = Math.round(maxScroll / cardWidthWithGap) * cardWidthWithGap;
        
        // If we scrolled past the second set, jump back to the middle snapped boundary
        if (container.scrollLeft >= snappedMax * 2) {
          container.scrollLeft = container.scrollLeft - snappedMax;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft = snappedMax;
        } else {
          container.scrollLeft += speed;
        }
      }, 30);
    };

    const handleScroll = () => {
      if (!container) return;
      const maxScroll = container.scrollWidth / 3;
      const snappedMax = Math.round(maxScroll / cardWidthWithGap) * cardWidthWithGap;
      
      // Auto-wrap scroll position instantly during manual scrolling
      if (container.scrollLeft >= snappedMax * 2) {
        container.scrollLeft = container.scrollLeft - snappedMax;
      } else if (container.scrollLeft <= snappedMax / 2) {
        container.scrollLeft = container.scrollLeft + snappedMax;
      }

      setShowLeftArrow(container.scrollLeft > 10);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    };

    container.addEventListener("scroll", handleScroll);
    
    // Pause auto-scroll on hover
    const handleMouseEnter = () => {
      clearInterval(intervalId);
    };
    const handleMouseLeave = () => {
      startAutoScroll();
    };

    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    startAutoScroll();

    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
      if (container) {
        container.removeEventListener("scroll", handleScroll);
        container.removeEventListener("mouseenter", handleMouseEnter);
        container.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Calculate current snaps
    const currentIndex = Math.round(container.scrollLeft / cardWidthWithGap);
    const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;
    const targetScroll = targetIndex * cardWidthWithGap;

    // Scroll with custom fast cubic ease-out animation (220ms duration)
    animateScroll(container, targetScroll, 220);
  };

  return (
    <div className="relative group w-full">
      {/* Left button */}
      <button
        onClick={() => scroll("left")}
        type="button"
        className={`absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-800 shadow-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer md:opacity-0 md:group-hover:opacity-100 ${
          showLeftArrow ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        title="Slide left"
      >
        <FaChevronLeft className="text-lg" />
      </button>

      {/* Right button */}
      <button
        onClick={() => scroll("right")}
        type="button"
        className={`absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white border border-slate-200 text-slate-800 shadow-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer md:opacity-0 md:group-hover:opacity-100 ${
          showRightArrow ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        }`}
        title="Slide right"
      >
        <FaChevronRight className="text-lg" />
      </button>

      {/* Viewport container */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto no-scrollbar mt-6 rounded-[2rem] py-2 px-1 flex gap-6"
        style={{ scrollbarWidth: "none" }}
      >
        {displayProducts.map((item, index) => (
          <Link
            key={`${item.id}-${index}`}
            href={`/products/${item.id}`}
            className="flex-shrink-0 w-[280px] group/card overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
          >
            <div className="relative h-44 bg-gradient-to-br from-[#f7f9ff] to-[#dbe7ff]">
              {getProductImage(item) ? (
                <img
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                  src={getProductImage(item) ?? undefined}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl">👟</div>
              )}
              {item.discount && (
                <span className="absolute left-4 top-4 rounded-full bg-rose-500 px-3 py-1 text-xs font-semibold text-white">
                  {item.discount}
                </span>
              )}
              {item.promotion && (
                <span className="absolute bottom-4 left-4 rounded-full bg-amber-400 px-3 py-1 text-xs font-semibold text-[#1b1202]">
                  {item.promotion}
                </span>
              )}
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-center justify-between gap-3 text-xs text-slate-500">
                <span>{item.brand}</span>
                <span>{item.category}</span>
              </div>
              <h3 className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">{item.name}</h3>
              <div className="mt-3 flex items-center gap-2">
                <span className="text-base font-semibold text-rose-600">{item.price}</span>
                <span className="text-xs text-slate-400 line-through">{item.oldPrice}</span>
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                <FaStar className="text-amber-400" /> {item.rating.toFixed(1)} | {item.sold} sold
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
