"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HomeHero } from "@/components/HomeHero";
import { PlatsMenuCarte } from "@/components/home/PlatsMenuCarte";
import { SpectaclesShowcase } from "@/components/home/SpectaclesShowcase";
import { VipGallery } from "@/components/home/VipGallery";
import { ContactSection } from "@/components/ContactSection";
import type { MenuItem, Spectacle, VenueSettings } from "@/lib/types";

export default function HomePage() {
  const [spectacles, setSpectacles] = useState<Spectacle[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [venue, setVenue] = useState<VenueSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () =>
      fetch("/api/public", { cache: "no-store" })
        .then((r) => r.json())
        .then((d) => {
          setSpectacles(d.spectacles);
          setMenuItems(d.menuItems ?? []);
          setVenue(d.venue);
        })
        .finally(() => setLoading(false));
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="pb-16">
      <HomeHero />

      {loading ? (
        <p className="py-20 text-center text-sm text-gray-500">Chargement…</p>
      ) : (
        <>
          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <section id="spectacles" className="scroll-mt-28 py-16 sm:py-24">
              <LuxurySectionTitle
                title="Prochains spectacles"
                subtitle="Vendredis & samedis — live music"
              />
              <SpectaclesShowcase spectacles={spectacles} />
            </section>
          </div>

          <section id="plats" className="scroll-mt-28 border-t border-yele-orange/10">
            <PlatsMenuCarte menuItems={menuItems} />
          </section>

          <div className="mx-auto max-w-6xl px-4 sm:px-8">
            <section id="vip" className="scroll-mt-28 border-t border-yele-orange/10 py-16 sm:py-24">
              <LuxurySectionTitle
                title="Espace VIP & Open Space"
                subtitle="Deux ambiances pour vos soirées"
              />
              <VipGallery />
            </section>

            <div id="contact" className="scroll-mt-32 border-t border-yele-orange/10">
              {venue && <ContactSection venue={venue} />}
            </div>

            <section className="border-t border-yele-orange/10 py-12 text-center">
              <p className="luxury-label mb-4">Accès équipe</p>
              <div className="flex flex-wrap justify-center gap-3 text-sm">
                <Link href="/serveur" className="btn-luxury-ghost">
                  Serveurs
                </Link>
                <Link href="/bar" className="btn-luxury-ghost">
                  Bar
                </Link>
                <Link href="/admin" className="btn-luxury-ghost">
                  Admin
                </Link>
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function LuxurySectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-10 text-center">
      <h2 className="luxury-title text-3xl text-yele-charcoal sm:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-sm tracking-wide text-gray-500">{subtitle}</p>
    </div>
  );
}
