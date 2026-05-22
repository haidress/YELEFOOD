"use client";

import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { MenuItem } from "@/lib/types";
import { CarteImageShowcase } from "./CarteImageShowcase";

const CATEGORIES: {
  id: string;
  title: string;
  subtitle?: string;
  match: (item: MenuItem) => boolean;
  image?: string;
}[] = [
  {
    id: "specialites",
    title: "Spécialités du chef",
    subtitle: "Les incontournables Yele Food",
    match: (i) =>
      i.description?.includes("Spécialité") ||
      ["Poulet Mayo", "Poisson Braisé", "Poisson Frit"].includes(i.name),
    image: "/images/plat-poulet-mayo.jpg",
  },
  {
    id: "mer",
    title: "La Mer",
    subtitle: "Poissons et riz au gras",
    match: (i) =>
      /poisson|tchep/i.test(i.name) && !i.description?.includes("Spécialité"),
    image: "/images/plat-poisson-braise.jpg",
  },
  {
    id: "tradition",
    title: "Tradition ivoirienne",
    subtitle: "Foutou, placali, riz et sauces maison",
    match: (i) =>
      /foutou|riz graine|placali|cabato|arrachide|sauce feuille|eguissi|amala|lokossou/i.test(
        i.name
      ),
  },
  {
    id: "terre",
    title: "La Terre",
    subtitle: "Viandes et plats mijotés",
    match: (i) =>
      /yassa|haricot|mouton|tchep poulet/i.test(i.name) &&
      !/tchep poisson/i.test(i.name),
  },
];

function groupPlats(items: MenuItem[]) {
  const used = new Set<string>();
  const groups: { meta: (typeof CATEGORIES)[0]; items: MenuItem[] }[] = [];

  for (const cat of CATEGORIES) {
    const list = items.filter((i) => cat.match(i) && !used.has(i.id));
    list.forEach((i) => used.add(i.id));
    if (list.length > 0) groups.push({ meta: cat, items: list });
  }

  const rest = items.filter((i) => !used.has(i.id));
  if (rest.length > 0) {
    groups.push({
      meta: {
        id: "autres",
        title: "Notre carte",
        match: () => false,
      },
      items: rest,
    });
  }

  return groups;
}

export function PlatsMenuCarte({ menuItems }: { menuItems: MenuItem[] }) {
  const plats = menuItems.filter((m) => m.category === "plats" && m.available);
  const groups = groupPlats(plats);

  return (
    <section className="relative">
      <div className="bg-gradient-to-b from-yele-cream via-white to-yele-cream pt-12 pb-10 sm:pt-16 sm:pb-14">
        <div className="text-center px-4 mb-8 sm:mb-10">
          <p className="luxury-label">Gastronomie & ambiance</p>
          <h2 className="mt-3 luxury-title text-3xl text-yele-charcoal sm:text-4xl md:text-5xl">
            La Carte
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm text-gray-600 leading-relaxed sm:text-base">
            Cuisine ivoirienne et spécialités maison — tarif unique, préparé à
            la commande.
          </p>
        </div>
        <CarteImageShowcase />
      </div>

      {/* Liste type Parenthèse */}
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="mb-14 border border-yele-orange/20 bg-white/80 p-6 text-center sm:p-8">
          <p className="luxury-label">Tarif unique</p>
          <p className="mt-2 font-display text-2xl text-yele-charcoal sm:text-3xl">
            Carte week-end
          </p>
          <p className="mt-2 text-sm text-gray-600">
            Les prix ci-dessous s&apos;appliquent tous les jours de la semaine.
          </p>
        </div>

        {groups.map(({ meta, items }, gi) => (
          <div key={meta.id} className={gi > 0 ? "mt-16 sm:mt-20" : ""}>
            {meta.image && (
              <div className="relative mb-8 aspect-[21/9] min-h-[160px] overflow-hidden border border-yele-orange/10">
                <Image
                  src={meta.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                />
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="luxury-title text-2xl text-yele-charcoal sm:text-3xl">
                {meta.title}
              </h3>
              {meta.subtitle && (
                <p className="mt-2 text-sm text-gray-500">{meta.subtitle}</p>
              )}
            </div>

            <ul className="divide-y divide-yele-orange/15 border-t border-b border-yele-orange/15">
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex gap-4 items-start justify-between py-5 sm:py-6"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <h4 className="font-display text-lg text-yele-charcoal sm:text-xl">
                        {item.name}
                      </h4>
                      {item.description?.includes("Spécialité") && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-yele-orange">
                          Signature
                        </span>
                      )}
                      {item.name.includes("pain offert") && (
                        <span className="text-[10px] uppercase tracking-wider text-gray-400">
                          Pain offert
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 leading-relaxed">
                      {item.description || "Plat maison"}
                    </p>
                  </div>
                  {item.imageUrl && (
                    <div className="relative hidden sm:block h-16 w-16 shrink-0 overflow-hidden border border-yele-orange/10">
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  )}
                  <p className="shrink-0 font-display text-lg text-yele-orange sm:text-xl tabular-nums whitespace-nowrap">
                    {formatPrice(item.price)}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <p className="mt-12 text-center text-xs text-gray-500 leading-relaxed">
          Nos plats sont préparés à la commande. Merci de nous signaler vos
          allergies.
        </p>
        <p className="mt-8 text-center">
          <Link href="/client?tab=commande" className="btn-luxury-outline">
            Commander
          </Link>
        </p>
      </div>
    </section>
  );
}
