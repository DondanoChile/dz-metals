"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ShoppingCart, Package, Check } from "lucide-react";

export default function RegisterCTA() {
  const t = useTranslations("cta");

  const cards = [
    {
      type: "buyer",
      href: "/register/buyer",
      Icon: ShoppingCart,
      benefitKeys: ["buyer.b1", "buyer.b2", "buyer.b3"],
    },
    {
      type: "seller",
      href: "/register/seller",
      Icon: Package,
      benefitKeys: ["seller.b1", "seller.b2", "seller.b3"],
    },
  ] as const;

  return (
    <section className="py-20 border-t border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#C9A84C]/50" />
            <span className="text-xs font-mono tracking-[0.25em] text-[#C9A84C] uppercase">
              {t("eyebrow")}
            </span>
            <div className="h-px w-8 bg-[#C9A84C]/50" />
          </div>
          <h2 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[#F5F0E8]">
            {t("heading")}
          </h2>
          <p className="mt-3 text-sm text-[#9A9A8A] font-inter max-w-xl mx-auto">
            {t("subheading")}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {cards.map(({ type, href, Icon, benefitKeys }) => (
            <div
              key={type}
              className="group relative bg-[#141414] border border-[#2A2A2A] hover:border-[#C9A84C]/50 transition-colors duration-300 p-8 flex flex-col gap-6"
            >
              {/* Gold top accent on hover */}
              <div className="absolute top-0 left-0 right-0 h-px bg-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon + title */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 flex items-center justify-center bg-[#C9A84C]/10 rounded">
                  <Icon size={22} className="text-[#C9A84C]" />
                </div>
                <h3 className="font-cormorant text-2xl font-semibold text-[#F5F0E8]">
                  {t(`${type}.title`)}
                </h3>
              </div>

              {/* Description */}
              <p className="text-sm text-[#9A9A8A] font-inter leading-relaxed">
                {t(`${type}.description`)}
              </p>

              {/* Benefits */}
              <ul className="flex flex-col gap-3">
                {benefitKeys.map((key) => (
                  <li key={key} className="flex items-start gap-3">
                    <Check size={14} className="text-[#C9A84C] shrink-0 mt-0.5" />
                    <span className="text-sm text-[#F5F0E8] font-inter">
                      {t(key)}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={href}
                className="mt-auto inline-flex items-center justify-center px-6 py-3 border border-[#C9A84C] text-[#C9A84C] text-sm font-inter tracking-wide hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-all duration-200"
              >
                {t(`${type}.cta`)}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
