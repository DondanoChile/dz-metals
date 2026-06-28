import { MapPin, Phone, MessageCircle, Mail, Building2 } from "lucide-react";

interface CompanyInfo {
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  rut?: string | null;
}

interface ContactStripProps {
  companyInfo: CompanyInfo | null;
}

const DEFAULTS: Required<CompanyInfo> = {
  address: "Santiago, Región Metropolitana, Chile",
  phone: "+56 9 0000 0000",
  whatsapp: "56900000000",
  email: "contacto@dzmetals.cl",
  rut: "00.000.000-0",
};

export default function ContactStrip({ companyInfo }: ContactStripProps) {
  const info: Required<CompanyInfo> = {
    address: companyInfo?.address ?? DEFAULTS.address,
    phone: companyInfo?.phone ?? DEFAULTS.phone,
    whatsapp: companyInfo?.whatsapp ?? DEFAULTS.whatsapp,
    email: companyInfo?.email ?? DEFAULTS.email,
    rut: companyInfo?.rut ?? DEFAULTS.rut,
  };

  const items = [
    {
      Icon: MapPin,
      label: "Dirección",
      value: info.address,
      href: null,
    },
    {
      Icon: Phone,
      label: "Teléfono",
      value: info.phone,
      href: `tel:${info.phone?.replace(/\s/g, "")}`,
    },
    {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: info.phone,
      href: `https://wa.me/${info.whatsapp ?? ""}`,
    },
    {
      Icon: Mail,
      label: "Email",
      value: info.email,
      href: `mailto:${info.email ?? ""}`,
    },
    {
      Icon: Building2,
      label: "RUT",
      value: info.rut,
      href: null,
    },
  ];

  return (
    <div className="w-full bg-[#0A0A0A] border-t border-[#2A2A2A] py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-between gap-5">
          {items.map(({ Icon, label, value, href }) => (
            <div key={label} className="flex items-center gap-2.5">
              <Icon size={14} className="text-[#C9A84C] shrink-0" />
              <div className="flex flex-col">
                <span className="text-xs text-[#9A9A8A] font-mono tracking-wide uppercase">
                  {label}
                </span>
                {href ? (
                  <a
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-sm text-[#F5F0E8] font-inter hover:text-[#C9A84C] transition-colors"
                  >
                    {value}
                  </a>
                ) : (
                  <span className="text-sm text-[#F5F0E8] font-inter">{value}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
