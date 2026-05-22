"use client";

import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import type { Spectacle } from "@/lib/types";

const FALLBACK = [
  {
    id: "s1",
    artist: "Soirée Orchestre Live",
    date: "2026-05-23",
    dayLabel: "Vendredi",
    description: "Afro-jazz & ambiance festive",
    imageUrl: "/images/spectacle-1.jpg",
  },
  {
    id: "s2",
    artist: "DJ & Percussions",
    date: "2026-05-24",
    dayLabel: "Samedi",
    description: "Jusqu'au bout de la nuit",
    imageUrl: "/images/spectacle-2.jpg",
  },
];

function upcomingSpectacles(spectacles: Spectacle[]) {
  const today = new Date().toISOString().slice(0, 10);
  return [...spectacles]
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function SpectaclesShowcase({ spectacles }: { spectacles: Spectacle[] }) {
  const upcoming = upcomingSpectacles(spectacles);
  const items =
    upcoming.length > 0
      ? upcoming.map((s) => ({
          id: s.id,
          artist: s.artist,
          date: s.date,
          dayLabel: s.dayLabel,
          description: s.description,
          imageUrl: s.imageUrl || "/images/spectacle-1.jpg",
        }))
      : FALLBACK;

  return (
    <section>
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((s) => (
          <article
            key={s.id}
            className="group relative overflow-hidden border border-yele-orange/10 min-h-[320px] sm:min-h-[400px]"
          >
            <Image
              src={s.imageUrl}
              alt={s.artist}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 text-white">
              <span className="badge">{s.dayLabel}</span>
              <h3 className="mt-2 text-2xl font-bold sm:text-3xl">{s.artist}</h3>
              <p className="mt-1 text-yele-orange-light font-medium">
                {formatDate(s.date)}
              </p>
              <p className="mt-2 text-sm text-white/85 line-clamp-2">
                {s.description}
              </p>
            </div>
          </article>
        ))}
      </div>
      <p className="mt-6 text-center">
        <Link href="/client" className="btn-luxury-outline">
          Réserver pour une soirée
        </Link>
      </p>
    </section>
  );
}
