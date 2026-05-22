"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const PLATS = [
  {
    name: "Cocktail",
    tag: "Signature",
    image: "/images/plat-cocktail.jpg",
  },
  {
    name: "Poulet Mayo",
    tag: "Spécialité",
    image: "/images/plat-poulet-mayo.jpg",
  },
  {
    name: "Poisson Braisé",
    tag: "Fraîcheur",
    image: "/images/plat-poisson-braise.jpg",
  },
  {
    name: "Poisson Frit",
    tag: "Maison",
    image: "/images/plat-poisson-frit.jpg",
  },
];

export function PlatsShowcase() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setActive((i) => (i + 1) % PLATS.length);
    }, 4000);
    return () => clearInterval(t);
  }, []);

  return (
    <section>
      <div className="relative overflow-hidden border border-yele-orange/10 bg-yele-charcoal">
        <div className="relative aspect-[4/5] sm:aspect-[21/9]">
          {PLATS.map((plat, i) => (
            <div
              key={plat.name}
              className={`absolute inset-0 transition-all duration-1000 ease-out ${
                i === active
                  ? "opacity-100 scale-100 z-10"
                  : "opacity-0 scale-105 z-0"
              }`}
            >
              <Image
                src={plat.image}
                alt={plat.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
                priority={i === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 text-white">
                <span className="badge">{plat.tag}</span>
                <h3 className="mt-3 font-display text-3xl font-light sm:text-5xl">
                  {plat.name}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2 sm:bottom-6">
          {PLATS.map((plat, i) => (
            <button
              key={plat.name}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-14 w-14 overflow-hidden rounded-xl border-2 transition sm:h-16 sm:w-16 ${
                i === active
                  ? "border-yele-orange scale-110 shadow-lg"
                  : "border-white/40 opacity-70 hover:opacity-100"
              }`}
              aria-label={plat.name}
            >
              <Image src={plat.image} alt="" fill className="object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:hidden">
        {PLATS.map((plat, i) => (
          <button
            key={plat.name}
            type="button"
            onClick={() => setActive(i)}
            className={`relative aspect-square overflow-hidden rounded-xl ${
              i === active ? "ring-2 ring-yele-orange" : ""
            }`}
          >
            <Image src={plat.image} alt={plat.name} fill className="object-cover" />
          </button>
        ))}
      </div>
    </section>
  );
}
