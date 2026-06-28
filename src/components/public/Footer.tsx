"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

const NAV_LINKS = [
  { key: "inicio", href: "/" },
  { key: "sobre", href: "/about" },
  { key: "commodities", href: "/commodities" },
  { key: "proceso", href: "/process" },
  { key: "contacto", href: "/contact" },
];

const LEGAL_LINKS = [
  { key: "legal", href: "/legal" },
  { key: "privacy", href: "/legal#privacidad" },
  { key: "terms", href: "/legal#terminos" },
];

export default function Footer() {
  const t = useTranslations("footer");

  return (
    <footer className="bg-[#0A0A0A] border-t border-[#C9A84C]/40 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand column */}
          <div className="flex flex-col gap-4">
            <span className="font-cormorant text-2xl font-semibold tracking-widest text-[#C9A84C] uppercase">
              DZ Metals
            </span>
            <p className="text-sm text-[#9A9A8A] font-inter leading-relaxed max-w-xs">
              {t("tagline")}
            </p>
          </div>

          {/* Nav column */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C9A84C] font-inter mb-1">
              {t("navigation")}
            </span>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-sm text-[#9A9A8A] hover:text-[#F5F0E8] transition-colors font-inter"
              >
                {t(`nav.${link.key}`)}
              </Link>
            ))}
          </div>

          {/* Legal column */}
          <div className="flex flex-col gap-3">
            <span className="text-xs uppercase tracking-widest text-[#C9A84C] font-inter mb-1">
              {t("legal")}
            </span>
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.key}
                href={link.href}
                className="text-sm text-[#9A9A8A] hover:text-[#F5F0E8] transition-colors font-inter"
              >
                {t(`legalLinks.${link.key}`)}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-[#2A2A2A] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[#9A9A8A] font-inter">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <p className="text-xs text-[#9A9A8A] font-inter">
            {t("disclaimer")}
          </p>
          <p className="text-xs text-[#9A9A8A] font-inter">
            Sitio web desarrollado por{" "}
            <a
              href="https://www.dzdigital.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C9A84C] hover:text-[#b8973b] transition-colors"
            >
              DZ Digital
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
