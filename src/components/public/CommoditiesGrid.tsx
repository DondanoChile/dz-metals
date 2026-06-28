"use client";

import { useTranslations } from "next-intl";
import { Gem, Zap, CircleDot, FlaskConical, Waves, MoreHorizontal } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Commodity {
  key: string;
  symbol: string;
  Icon: LucideIcon;
  noLME?: boolean;
}

const COMMODITIES: Commodity[] = [
  { key: "oro", symbol: "XAU", Icon: Gem },
  { key: "cobre", symbol: "XCU", Icon: Zap },
  { key: "plata", symbol: "XAG", Icon: CircleDot },
  { key: "molibdeno", symbol: "MO", Icon: FlaskConical },
  { key: "sal", symbol: "—", Icon: Waves, noLME: true },
  { key: "otros", symbol: "VAR", Icon: MoreHorizontal },
];

export default function CommoditiesGrid() {
  const t = useTranslations("commodities");

  return (
    <section className="py-20 border-t border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#C9A84C]/50" />
            <span className="text-xs font-mono tracking-[0.25em] text-[#C9A84C] uppercase">
              {t("eyebrow")}
            </span>
          </div>
          <h2 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[#F5F0E8] max-w-xl">
            {t("heading")}
          </h2>
          <p className="mt-3 text-sm text-[#9A9A8A] font-inter max-w-2xl">
            {t("subheading")}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {COMMODITIES.map(({ key, symbol, Icon, noLME }) => (
            <div
              key={key}
              className="group relative bg-[#141414] border border-[#2A2A2A] rounded-lg p-6 hover:border-[#C9A84C]/50 transition-colors duration-300 flex flex-col gap-4"
            >
              {/* Icon + symbol */}
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 flex items-center justify-center bg-[#C9A84C]/10 rounded">
                  <Icon size={18} className="text-[#C9A84C]" />
                </div>
                <span className="font-mono text-xs text-[#9A9A8A] tracking-widest">
                  {symbol}
                </span>
              </div>

              {/* Name */}
              <div>
                <h3 className="font-cormorant text-xl font-semibold text-[#F5F0E8] capitalize">
                  {t(`items.${key}.name`)}
                </h3>
                <p className="mt-1 text-sm text-[#9A9A8A] font-inter leading-relaxed">
                  {t(`items.${key}.description`)}
                </p>
              </div>

              {/* Key uses */}
              <ul className="flex flex-col gap-1.5 mt-auto">
                {(t.raw(`items.${key}.uses`) as string[]).map(
                  (use: string, i: number) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-xs text-[#9A9A8A] font-inter"
                    >
                      <span className="w-1 h-1 rounded-full bg-[#C9A84C]/60 shrink-0" />
                      {use}
                    </li>
                  )
                )}
              </ul>

              {/* LME note */}
              {noLME ? (
                <div className="mt-2 text-xs font-mono text-[#9A9A8A] border-t border-[#2A2A2A] pt-3">
                  {t("noLMENote")}
                </div>
              ) : (
                <div className="mt-2 text-xs font-mono text-[#C9A84C]/60 border-t border-[#2A2A2A] pt-3">
                  {t("lmeNote")}
                </div>
              )}

              {/* Hover gold top line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
