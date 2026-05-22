import Image from "next/image";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  linkToHome?: boolean;
}

const sizes = { sm: 48, md: 72, lg: 100 };

export function Logo({ size = "md", linkToHome = true }: LogoProps) {
  const h = sizes[size];
  const img = (
    <Image
      src="/logo.png"
      alt="Yele Food — Forcément c'est doux"
      width={Math.round(h * 2.2)}
      height={h}
      className="h-auto w-auto object-contain"
      priority
    />
  );
  if (linkToHome) {
    return (
      <Link href="/" className="inline-block shrink-0">
        {img}
      </Link>
    );
  }
  return img;
}
