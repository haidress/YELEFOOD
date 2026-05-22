"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const SLIDES = [
  {
    src: "/images/plat-poulet-mayo.jpg",
    name: "Poulet Mayo",
    tag: "Spécialité",
  },
  {
    src: "/images/plat-poisson-braise.jpg",
    name: "Poisson Braisé",
    tag: "La Mer",
  },
  {
    src: "/images/plat-poisson-frit.jpg",
    name: "Poisson Frit",
    tag: "Maison",
  },
  {
    src: "/images/plat-cocktail.jpg",
    name: "Cocktail",
    tag: "Signature",
  },
];

export function CarteImageShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((i) => (i + 1) % SLIDES.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <div className="grid items-center gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
        <div className="relative aspect-[4/5] overflow-hidden border border-yele-orange/20 bg-white shadow-sm sm:aspect-[5/4]">
          {SLIDES.map((s, i) => (
            <div
              key={s.src}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                i === active ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={s.src}
                alt={s.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 55vw"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-yele-orange-light">
                  {s.tag}
                </span>
                <p className="mt-1 font-display text-2xl sm:text-3xl">{s.name}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 sm:grid-cols-2 lg:grid-cols-2">
          {SLIDES.map((s, i) => (
            <button
              key={s.src}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-square overflow-hidden border-2 transition-all ${
                i === active
                  ? "border-yele-orange shadow-md scale-[1.02]"
                  : "border-yele-orange/15 opacity-80 hover:opacity-100"
              }`}
              aria-label={`Voir ${s.name}`}
              aria-current={i === active}
            >
              <Image src={s.src} alt="" fill className="object-cover" sizes="120px" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-8 bg-yele-orange" : "w-1.5 bg-yele-orange/30"
            }`}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
