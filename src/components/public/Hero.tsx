"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

interface HeroProps {
  ticker?: ReactNode;
}

export default function Hero({ ticker }: HeroProps) {
  const t = useTranslations("hero");

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background texture pattern */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 50%, rgba(201,168,76,0.04) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(201,168,76,0.03) 0%, transparent 40%),
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 60px,
              rgba(201,168,76,0.015) 60px,
              rgba(201,168,76,0.015) 61px
            )
          `,
          backgroundColor: "#0A0A0A",
        }}
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 z-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vertical gold rule left */}
      <div className="absolute left-6 top-1/4 bottom-1/4 w-px bg-gradient-to-b from-transparent via-[#C9A84C]/40 to-transparent hidden lg:block z-10" />

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-px w-10 bg-[#C9A84C]" />
            <span className="text-xs font-mono tracking-[0.3em] text-[#C9A84C] uppercase">
              {t("eyebrow")}
            </span>
          </div>

          {/* Headline */}
          <h1 className="font-cormorant text-5xl sm:text-6xl lg:text-7xl font-semibold leading-[1.1] text-[#F5F0E8] mb-6">
            {t.rich("headline", {
              gold: (chunks) => (
                <span className="text-[#C9A84C]">{chunks}</span>
              ),
            })}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#9A9A8A] font-inter leading-relaxed max-w-2xl mb-10">
            {t("subtitle")}
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register/buyer"
              className="inline-flex items-center justify-center px-8 py-4 bg-[#C9A84C] text-[#0A0A0A] font-inter font-medium tracking-wide text-sm hover:bg-[#b8973d] transition-colors duration-200"
            >
              {t("ctaBuyer")}
            </Link>
            <Link
              href="/register/seller"
              className="inline-flex items-center justify-center px-8 py-4 border border-[#C9A84C] text-[#C9A84C] font-inter font-medium tracking-wide text-sm hover:bg-[#C9A84C]/10 transition-colors duration-200"
            >
              {t("ctaSeller")}
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="flex items-center gap-6 mt-12">
            {(["trust1", "trust2", "trust3"] as const).map((key, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[#C9A84C]" />
                <span className="text-xs text-[#9A9A8A] font-inter">
                  {t(key)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticker slot pinned at bottom */}
      {ticker && (
        <div className="relative z-10 mt-auto">
          {ticker}
        </div>
      )}

      {/* Bottom gold line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/50 to-transparent" />
    </section>
  );
}
