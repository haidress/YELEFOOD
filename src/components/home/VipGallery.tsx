"use client";

import Image from "next/image";
import Link from "next/link";

const VIP_IMAGES = [
  {
    src: "/images/vip-1.jpg",
    title: "Espace VIP",
    desc: "Confort et intimité pour vos soirées",
  },
  {
    src: "/images/vip-2.jpg",
    title: "Salon VIP",
    desc: "Service premium Yele Food",
  },
  {
    src: "/images/vip-3.jpeg",
    title: "Ambiance exclusive",
    desc: "Open Space & VIP disponibles",
  },
];

export function VipGallery() {
  return (
    <section className="relative">
      <div className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {VIP_IMAGES.map((item, i) => (
          <div
            key={item.src}
            className={`group relative overflow-hidden border border-yele-orange/10 ${
              i === 0 ? "sm:row-span-1 sm:min-h-[280px]" : "min-h-[220px] sm:min-h-[260px]"
            }`}
          >
            <Image
              src={item.src}
              alt={item.title}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition group-hover:opacity-100" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <span className="badge text-[10px]">VIP</span>
              <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-white/85">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
      <p className="mt-10 text-center">
        <Link href="/client" className="btn-luxury-outline">
          Réserver zone VIP ou Open Space
        </Link>
      </p>
    </section>
  );
}
