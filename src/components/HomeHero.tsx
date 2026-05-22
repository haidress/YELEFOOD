"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const PHONE_DISPLAY = "+225 07 10 42 06 70";

const SLIDES = [
  { src: "/images/hero-parallax.jpg", alt: "Bar & lounge Yele Food" },
  { src: "/images/vip-1.jpg", alt: "Ambiance lounge" },
  { src: "/images/spectacle-1.jpg", alt: "Soirée live" },
  { src: "/images/plat-poisson-braise.jpg", alt: "Poisson braisé" },
];

export function HomeHero() {
  const [mounted, setMounted] = useState(false);
  const [slide, setSlide] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => {
      setSlide((i) => (i + 1) % SLIDES.length);
    }, 5000);
    const onScroll = () => setOffset(window.scrollY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      clearInterval(t);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section id="accueil" className="bg-yele-cream overflow-hidden">
      <div className="flex min-h-[min(85vh,720px)] flex-col lg:flex-row">
        {/* Gauche — dégradé animé + informations */}
        <div className="relative flex flex-col justify-center px-6 py-12 sm:px-10 sm:py-16 lg:w-[42%] lg:max-w-xl lg:shrink-0 lg:py-20 xl:w-[38%]">
          <div
            className="hero-gradient-flow absolute inset-0"
            aria-hidden
          />
          <div className="hero-shine absolute inset-0 overflow-hidden" aria-hidden />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/5 lg:to-black/10" />

          <div className="relative z-10 text-white">
            <p
              className={`text-[10px] font-semibold uppercase tracking-[0.35em] text-white/90 sm:text-xs transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "0.1s" }}
            >
              Cocody Angré · Gestoci
            </p>
            <h1
              className={`mt-4 font-display text-4xl font-light leading-tight sm:text-5xl lg:text-[2.75rem] xl:text-6xl transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "0.25s" }}
            >
              Yele Food Lounge
            </h1>
            <p
              className={`mt-4 font-display text-xl italic text-white/95 sm:text-2xl transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "0.4s" }}
            >
              Forcément c&apos;est doux !
            </p>

            <p
              className={`mt-8 max-w-md text-sm leading-relaxed text-white/90 sm:text-base transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "0.55s" }}
            >
              Restaurant, bar et lounge. Cuisine ivoirienne, orchestre live le
              week-end, espaces VIP & Open Space pour vos soirées.
            </p>

            <div
              className={`mt-8 space-y-1.5 text-sm text-white/85 transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{ transitionDelay: "0.65s" }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70">
                Horaires
              </p>
              <p>Service en soirée — 7j/7</p>
              <p>Spectacles : vendredis & samedis</p>
              <p className="pt-1 italic">Réservation conseillée</p>
            </div>

            <div
              className={`mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap transition-all duration-700 ${
                mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transitionDelay: "0.8s" }}
            >
              <Link
                href="/client"
                className="inline-block border-2 border-white bg-white px-7 py-3 text-center text-xs font-bold uppercase tracking-[0.15em] text-yele-orange transition hover:scale-[1.02] hover:bg-white/90 hover:shadow-lg"
              >
                Réserver une table
              </Link>
              <a
                href="tel:+2250710420670"
                className="inline-block border border-white/60 px-7 py-3 text-center text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:scale-[1.02] hover:bg-white/10"
              >
                {PHONE_DISPLAY}
              </a>
            </div>

            {/* Indicateurs visuels liés aux photos */}
            <div
              className={`mt-8 flex gap-2 transition-opacity duration-700 ${
                mounted ? "opacity-100" : "opacity-0"
              }`}
              style={{ transitionDelay: "1s" }}
            >
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSlide(i)}
                  className={`h-1 rounded-full transition-all duration-300 ${
                    i === slide
                      ? "w-8 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Photo ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Droite — images en fondu + léger parallaxe */}
        <div className="relative min-h-[300px] flex-1 lg:min-h-0">
          <div
            className="absolute inset-0 will-change-transform"
            style={{ transform: `translate3d(0, ${offset * 0.25}px, 0)` }}
          >
            {SLIDES.map((s, i) => (
              <div
                key={s.src}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                  i === slide ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <div
                  className={`relative h-full w-full ${
                    i === slide ? "animate-hero-zoom" : ""
                  }`}
                >
                  <Image
                    src={s.src}
                    alt={s.alt}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    priority={i === 0}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="absolute inset-0 bg-gradient-to-l from-yele-orange/30 via-transparent to-transparent lg:from-yele-orange/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent lg:bg-none" />
        </div>
      </div>
    </section>
  );
}
