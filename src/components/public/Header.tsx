"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/navigation";
import { Menu, X } from "lucide-react";

const NAV_KEYS = ["inicio", "sobre", "commodities", "proceso", "contacto"] as const;
const NAV_HREFS: Record<string, string> = {
  inicio: "/",
  sobre: "/about",
  commodities: "/commodities",
  proceso: "/process",
  contacto: "/contact",
};

export default function Header() {
  const t = useTranslations("nav");
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  function switchLocale(locale: string) {
    router.replace(pathname, { locale });
  }

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#0A0A0A]/80 border-b border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="font-cormorant text-2xl font-semibold tracking-widest text-[#C9A84C] uppercase"
          >
            DZ Metals
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {NAV_KEYS.map((key) => (
              <Link
                key={key}
                href={NAV_HREFS[key]}
                className="text-sm font-inter text-[#9A9A8A] hover:text-[#F5F0E8] transition-colors duration-200 tracking-wide uppercase"
              >
                {t(key)}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="hidden md:flex items-center gap-4">
            {/* Language switcher */}
            <div className="flex items-center gap-1 text-xs font-mono text-[#9A9A8A]">
              <button
                onClick={() => switchLocale("es")}
                className="hover:text-[#C9A84C] transition-colors uppercase tracking-widest"
              >
                ES
              </button>
              <span className="text-[#2A2A2A]">|</span>
              <button
                onClick={() => switchLocale("en")}
                className="hover:text-[#C9A84C] transition-colors uppercase tracking-widest"
              >
                EN
              </button>
            </div>

            {/* CTA */}
            <Link
              href="/register"
              className="px-5 py-2 text-sm font-inter tracking-wide text-[#9A9A8A] hover:text-[#F5F0E8] transition-colors duration-200"
            >
              {t("register")}
            </Link>
            <Link
              href="/login"
              className="px-5 py-2 text-sm font-inter tracking-wide border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-all duration-200"
            >
              {t("login")}
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-[#9A9A8A] hover:text-[#F5F0E8] transition-colors"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden bg-[#0A0A0A] border-t border-[#2A2A2A] px-4 pb-6 pt-4 flex flex-col gap-4">
          {NAV_KEYS.map((key) => (
            <Link
              key={key}
              href={NAV_HREFS[key]}
              onClick={() => setMobileOpen(false)}
              className="text-sm font-inter text-[#9A9A8A] hover:text-[#F5F0E8] transition-colors uppercase tracking-wide"
            >
              {t(key)}
            </Link>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => switchLocale("es")}
              className="text-xs font-mono text-[#9A9A8A] hover:text-[#C9A84C] uppercase tracking-widest"
            >
              ES
            </button>
            <span className="text-[#2A2A2A]">|</span>
            <button
              onClick={() => switchLocale("en")}
              className="text-xs font-mono text-[#9A9A8A] hover:text-[#C9A84C] uppercase tracking-widest"
            >
              EN
            </button>
          </div>
          <Link
            href="/register"
            onClick={() => setMobileOpen(false)}
            className="mt-2 px-5 py-2 text-sm font-inter text-center text-[#9A9A8A] hover:text-[#F5F0E8] transition-colors"
          >
            {t("register")}
          </Link>
          <Link
            href="/login"
            onClick={() => setMobileOpen(false)}
            className="px-5 py-2 text-sm font-inter text-center border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0A0A0A] transition-all"
          >
            {t("login")}
          </Link>
        </div>
      )}
    </header>
  );
}
