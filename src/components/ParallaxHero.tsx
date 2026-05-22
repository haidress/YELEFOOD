"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";

export function ParallaxHero() {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffset(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section className="relative h-[85vh] min-h-[520px] max-h-[900px] w-full overflow-hidden">
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translate3d(0, ${offset * 0.45}px, 0) scale(1.08)` }}
      >
        <Image
          src="/images/hero-parallax.jpg"
          alt="Yele Food Lounge"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-yele-charcoal/95" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white">
        <div className="rounded-2xl bg-white/95 p-3 shadow-2xl backdrop-blur-sm mb-5">
          <Logo size="md" linkToHome={false} />
        </div>
        <p className="badge mb-3">Cocody Angré · Gestoci</p>
        <h1 className="text-4xl font-bold drop-shadow-2xl sm:text-6xl md:text-7xl tracking-tight">
          Yele Food Lounge
        </h1>
        <p className="mt-4 text-xl italic opacity-95 sm:text-2xl">
          Forcément c&apos;est doux !
        </p>
        <p className="mx-auto mt-3 max-w-lg text-sm text-white/85 sm:text-base">
          Restauration · Ambiance live · Espace VIP
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/client"
            className="rounded-xl bg-yele-orange px-8 py-3.5 font-bold text-white shadow-xl shadow-yele-orange/40 transition hover:scale-105 hover:bg-yele-orange-dark"
          >
            Réserver une table
          </Link>
          <Link
            href="/client?tab=commande"
            className="rounded-xl border-2 border-white/90 bg-white/10 px-8 py-3.5 font-bold backdrop-blur-md transition hover:scale-105 hover:bg-white/20"
          >
            Commander
          </Link>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 text-white/80 text-xs">
        ↓ Découvrir
      </div>
    </section>
  );
}
