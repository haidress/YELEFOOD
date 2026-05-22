"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export interface CarouselSlide {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string | null;
  badge?: string;
  emoji?: string;
}

interface CarouselProps {
  slides: CarouselSlide[];
  autoPlayMs?: number;
  aspectClass?: string;
  variant?: "hero" | "card" | "compact";
}

export function Carousel({
  slides,
  autoPlayMs = 5000,
  aspectClass = "aspect-[16/10] sm:aspect-[21/9]",
  variant = "card",
}: CarouselProps) {
  const [index, setIndex] = useState(0);
  const count = slides.length;

  const next = useCallback(() => {
    if (count <= 1) return;
    setIndex((i) => (i + 1) % count);
  }, [count]);

  const prev = useCallback(() => {
    if (count <= 1) return;
    setIndex((i) => (i - 1 + count) % count);
  }, [count]);

  useEffect(() => {
    if (count <= 1 || autoPlayMs <= 0) return;
    const t = setInterval(next, autoPlayMs);
    return () => clearInterval(t);
  }, [count, autoPlayMs, next]);

  if (count === 0) {
    return (
      <div className="rounded-2xl bg-yele-cream p-10 text-center text-gray-500">
        Contenu à venir
      </div>
    );
  }

  const slide = slides[index];
  const isHero = variant === "hero";

  return (
    <div className="group relative overflow-hidden rounded-2xl shadow-lg">
      <div
        className={`relative w-full ${aspectClass} bg-gradient-to-br from-yele-orange-dark to-yele-orange`}
      >
        {slide.imageUrl ? (
          <Image
            src={slide.imageUrl}
            alt={slide.title}
            fill
            className="object-cover transition-opacity duration-500"
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, 1200px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-6xl sm:text-8xl">
            {slide.emoji ?? "🍽️"}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent" />
        <div
          className={`absolute bottom-0 left-0 right-0 p-4 sm:p-6 text-white ${
            isHero ? "sm:p-10" : ""
          }`}
        >
          {slide.badge && <span className="badge mb-2">{slide.badge}</span>}
          <h3
            className={`font-bold leading-tight ${
              isHero ? "text-2xl sm:text-4xl" : "text-lg sm:text-2xl"
            }`}
          >
            {slide.title}
          </h3>
          {slide.subtitle && (
            <p className="mt-1 text-yele-orange-light font-medium text-sm sm:text-base">
              {slide.subtitle}
            </p>
          )}
          {slide.description && (
            <p
              className={`mt-2 text-white/90 ${
                isHero ? "text-sm sm:text-base max-w-2xl" : "text-sm line-clamp-2"
              }`}
            >
              {slide.description}
            </p>
          )}
        </div>
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            onClick={prev}
            className="absolute left-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow-md transition hover:bg-white sm:opacity-100"
            aria-label="Précédent"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute right-2 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-xl shadow-md transition hover:bg-white sm:opacity-100"
            aria-label="Suivant"
          >
            ›
          </button>
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === index
                    ? "w-8 bg-yele-orange"
                    : "w-2 bg-white/60 hover:bg-white"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
