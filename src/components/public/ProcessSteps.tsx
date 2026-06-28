"use client";

import { useTranslations } from "next-intl";
import { ClipboardList, PhoneCall, Handshake } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  number: string;
  Icon: LucideIcon;
  titleKey: string;
  descKey: string;
}

const STEPS: Step[] = [
  { number: "01", Icon: ClipboardList, titleKey: "step1.title", descKey: "step1.description" },
  { number: "02", Icon: PhoneCall, titleKey: "step2.title", descKey: "step2.description" },
  { number: "03", Icon: Handshake, titleKey: "step3.title", descKey: "step3.description" },
];

export default function ProcessSteps() {
  const t = useTranslations("process");

  return (
    <section className="py-20 border-t border-[#2A2A2A] bg-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
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

        {/* Steps */}
        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden lg:block absolute top-14 left-[calc(16.667%+2rem)] right-[calc(16.667%+2rem)] h-px bg-gradient-to-r from-[#C9A84C]/30 via-[#C9A84C]/60 to-[#C9A84C]/30 z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 lg:gap-6 relative z-10">
            {STEPS.map(({ number, Icon, titleKey, descKey }) => (
              <div
                key={number}
                className="flex flex-col items-center lg:items-start text-center lg:text-left gap-4"
              >
                {/* Step number + icon circle */}
                <div className="relative flex items-center justify-center w-28 h-28">
                  {/* Outer ring */}
                  <div className="absolute inset-0 rounded-full border border-[#C9A84C]/20" />
                  {/* Inner bg */}
                  <div className="w-20 h-20 rounded-full bg-[#0A0A0A] border border-[#2A2A2A] flex flex-col items-center justify-center gap-1">
                    <Icon size={16} className="text-[#C9A84C]" />
                    <span className="font-cormorant text-2xl font-semibold text-[#C9A84C] leading-none">
                      {number}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <h3 className="font-cormorant text-2xl font-semibold text-[#F5F0E8] mb-2">
                    {t(titleKey)}
                  </h3>
                  <p className="text-sm text-[#9A9A8A] font-inter leading-relaxed">
                    {t(descKey)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
