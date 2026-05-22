"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";

const PHONE = "+2250710420670";
const PHONE_DISPLAY = "+225 07 10 42 06 70";

const homeNav = [
  { href: "/#accueil", label: "Accueil" },
  { href: "/#spectacles", label: "Spectacles" },
  { href: "/#plats", label: "Plats" },
  { href: "/#vip", label: "Espace VIP" },
  { href: "/#contact", label: "Contact" },
];

const defaultNav = [
  { href: "/", label: "Accueil", exact: true },
  { href: "/client", label: "Réserver" },
];

export function Header() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isStaff =
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/serveur") ||
    pathname?.startsWith("/bar");

  if (isStaff) {
    return (
      <header className="sticky top-0 z-50 border-b border-yele-orange/15 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
          <Logo size="sm" />
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-500">
            Espace pro
          </span>
        </div>
      </header>
    );
  }

  if (isHome) {
    return (
      <header className="sticky top-0 z-50 border-b border-yele-orange/10 bg-yele-cream/98 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-3 sm:px-4">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 py-2">
            <a
              href={`tel:${PHONE}`}
              className="flex items-center gap-1 text-[10px] text-yele-charcoal transition hover:text-yele-orange sm:text-xs"
            >
              <PhoneIcon />
              <span className="hidden md:inline">{PHONE_DISPLAY}</span>
            </a>
            <div className="flex flex-col items-center">
              <Logo size="sm" />
              <p className="mt-0.5 text-[9px] font-medium tracking-[0.35em] text-yele-orange-dark sm:text-[10px]">
                ABIDJAN
              </p>
            </div>
            <div className="flex justify-end">
              <Link
                href="/client"
                className="btn-luxury-outline px-3 py-1 text-[10px] sm:px-4 sm:text-xs"
              >
                Réserver
              </Link>
            </div>
          </div>

          <nav
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1 border-t border-yele-orange/10 py-2 text-[10px] font-medium tracking-[0.18em] text-yele-charcoal sm:gap-x-7 sm:text-[11px] sm:tracking-[0.22em]"
            aria-label="Navigation principale"
          >
            {homeNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="uppercase transition hover:text-yele-orange"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 border-b border-yele-orange/15 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2">
        <Logo size="sm" />
        <nav className="flex items-center gap-1 text-sm">
          {defaultNav.map((item) => {
            const active = item.exact
              ? pathname === item.href
              : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-3 py-1.5 transition ${
                  active
                    ? "bg-yele-orange text-white"
                    : "text-yele-charcoal hover:text-yele-orange"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/client"
          className="btn-luxury-outline hidden px-4 py-1.5 text-xs sm:inline-block"
        >
          Réserver
        </Link>
      </div>
    </header>
  );
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-3.5 w-3.5 text-yele-orange sm:h-4 sm:w-4"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
        clipRule="evenodd"
      />
    </svg>
  );
}
