"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: React.ReactNode[];
  visibleItems?: 1 | 2 | 3 | 4;
  centerMode?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number;
  className?: string;
}

export function Carousel({
  children,
  visibleItems = 3,
  centerMode = false,
  autoPlay = false,
  autoPlayInterval = 3000,
  className,
}: CarouselProps) {
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isHovered, setIsHovered] = React.useState(false);

  // Menghitung total slides
  const totalSlides = React.Children.count(children);

  // Logika Scroll ke Item Tertentu
  const scrollTo = (index: number) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const width = container.clientWidth / visibleItems;

    container.scrollTo({
      left: width * index,
      behavior: "smooth",
    });
  };

  const next = () => {
    // Jika di akhir, kembali ke awal (Infinite Loop effect secara visual)
    const newIndex =
      activeIndex >= totalSlides - visibleItems ? 0 : activeIndex + 1;
    scrollTo(newIndex);
  };

  const prev = () => {
    const newIndex =
      activeIndex === 0 ? totalSlides - visibleItems : activeIndex - 1;
    scrollTo(newIndex);
  };

  // Event Listener untuk mendeteksi posisi scroll aktif
  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const width = container.clientWidth / visibleItems;
    // Hitung index berdasarkan posisi scroll saat ini
    const newIndex = Math.round(container.scrollLeft / width);
    setActiveIndex(newIndex);
  };

  // Logika AutoPlay
  React.useEffect(() => {
    if (!autoPlay || isHovered) return;
    const interval = setInterval(next, autoPlayInterval);
    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, activeIndex, isHovered]);

  // Kalkulasi lebar per item berdasarkan visibleItems
  const itemBasisClass = {
    1: "basis-full", // 100%
    2: "basis-1/2", // 50%
    3: "basis-1/3", // 33.33%
    4: "basis-1/4", // 25%
  }[visibleItems];

  return (
    <div
      className={cn("relative group w-full", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Container Scroll */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className={cn(
          "flex overflow-x-auto snap-x snap-mandatory scrollbar-hide py-4", // py-4 memberi ruang untuk efek scale
          // Sembunyikan scrollbar
          "[&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']",
        )}
      >
        {React.Children.map(children, (child, index) => {
          // Logika Center Mode Animation
          // Item dianggap "aktif" jika index-nya sama dengan activeIndex (atau +offset jika visibleItems > 1)
          // Untuk simplifikasi visual center mode, kita cek jarak index dari center virtual view

          let isActive = false;
          if (centerMode) {
            const centerOffset = Math.floor(visibleItems / 2);
            isActive = index === activeIndex + centerOffset;
          }

          return (
            <div
              className={cn(
                "snap-start shrink-0 px-2 transition-all duration-500 ease-out",
                itemBasisClass,
                centerMode && isActive
                  ? "scale-105 opacity-100 z-10 blur-none grayscale-0"
                  : centerMode
                    ? "scale-90 opacity-60 blur-[1px] grayscale"
                    : "scale-100 opacity-100",
              )}
            >
              {child}
            </div>
          );
        })}
      </div>

      {/* Navigation Buttons (Floating) */}
      {/* Prev */}
      <button
        onClick={prev}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-background/80 text-foreground p-2 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white disabled:opacity-0"
        disabled={activeIndex === 0 && !autoPlay} // Disable in early and not autoPlay
      >
        <ChevronLeft size={20} />
      </button>

      {/* Next */}
      <button
        onClick={next}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-20 rounded-full bg-background/80 text-foreground p-2 shadow-lg backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-primary hover:text-white"
      >
        <ChevronRight size={20} />
      </button>

      {/* Indicators / Dots */}
      <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
        {Array.from({ length: totalSlides - (visibleItems - 1) }).map(
          (_, i) => (
            <button
              key={i}
              onClick={() => scrollTo(i)}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIndex
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-sidebar-border hover:bg-sidebar-fg",
              )}
            />
          ),
        )}
      </div>
    </div>
  );
}
