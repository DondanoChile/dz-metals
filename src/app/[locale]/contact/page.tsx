import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import ContactForm from "@/components/public/ContactForm";
import { MapPin, Phone, MessageCircle, Mail, Building2 } from "lucide-react";
import { db } from "@/lib/db";
import { companyInfo as companyInfoTable } from "@/lib/db/schema";

export const metadata = {
  title: "Contacto | DZ Metals",
  description: "Ponte en contacto con DZ Metals. Estamos disponibles para responder tus consultas.",
};

async function getCompanyInfo() {
  try {
    const [info] = await db.select().from(companyInfoTable).limit(1);
    return info ?? null;
  } catch {
    return null;
  }
}

export default async function ContactPage() {
  const companyInfo = await getCompanyInfo();

  const address = companyInfo?.address ?? "Santiago, Región Metropolitana, Chile";
  const phone = companyInfo?.phone ?? "+56 9 0000 0000";
  const whatsapp = companyInfo?.whatsapp ?? "56900000000";
  const email = companyInfo?.emailContact ?? "contacto@dzmetals.cl";
  const rut = companyInfo?.rut ?? "00.000.000-0";

  const contactItems = [
    { Icon: MapPin, label: "Dirección", value: address, href: null },
    { Icon: Phone, label: "Teléfono", value: phone, href: `tel:${phone.replace(/\s/g, "")}` },
    {
      Icon: MessageCircle,
      label: "WhatsApp",
      value: phone,
      href: `https://wa.me/${whatsapp}`,
    },
    { Icon: Mail, label: "Email", value: email, href: `mailto:${email}` },
    { Icon: Building2, label: "RUT", value: rut, href: null },
  ];

  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 border-b border-[#2A2A2A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-[#C9A84C]/50" />
                <span className="text-xs font-mono tracking-[0.25em] text-[#C9A84C] uppercase">
                  Contacto
                </span>
              </div>
              <h1 className="font-cormorant text-5xl sm:text-6xl font-semibold text-[#F5F0E8] leading-tight mb-4">
                Hablemos
              </h1>
              <p className="text-base text-[#9A9A8A] font-inter leading-relaxed">
                Un broker revisará tu mensaje y responderá en un plazo máximo de
                24 horas hábiles. También puedes contactarnos directamente por
                teléfono o WhatsApp.
              </p>
            </div>
          </div>
        </section>

        {/* Main content */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Left: contact form */}
              <div>
                <h2 className="font-cormorant text-2xl font-semibold text-[#F5F0E8] mb-6">
                  Envíanos un mensaje
                </h2>
                <ContactForm />
              </div>

              {/* Right: contact info */}
              <div className="flex flex-col gap-8">
                <div>
                  <h2 className="font-cormorant text-2xl font-semibold text-[#F5F0E8] mb-6">
                    Información de contacto
                  </h2>
                  <div className="flex flex-col gap-5">
                    {contactItems.map(({ Icon, label, value, href }) => (
                      <div key={label} className="flex items-start gap-4">
                        <div className="w-8 h-8 flex items-center justify-center bg-[#C9A84C]/10 shrink-0">
                          <Icon size={14} className="text-[#C9A84C]" />
                        </div>
                        <div>
                          <div className="text-xs font-mono text-[#9A9A8A] tracking-wide uppercase mb-0.5">
                            {label}
                          </div>
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
                            <span className="text-sm text-[#F5F0E8] font-inter">
                              {value}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Map placeholder */}
                <div className="relative w-full h-52 bg-[#141414] border border-[#2A2A2A] overflow-hidden flex items-center justify-center">
                  <svg
                    className="absolute inset-0 w-full h-full opacity-10"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <defs>
                      <pattern
                        id="contact-grid"
                        width="30"
                        height="30"
                        patternUnits="userSpaceOnUse"
                      >
                        <path
                          d="M 30 0 L 0 0 0 30"
                          fill="none"
                          stroke="#C9A84C"
                          strokeWidth="0.5"
                        />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#contact-grid)" />
                  </svg>
                  <div className="relative text-center">
                    <div className="w-3 h-3 rounded-full bg-[#C9A84C] mx-auto mb-2 animate-pulse" />
                    <span className="text-xs font-mono text-[#C9A84C] tracking-widest uppercase">
                      Santiago, Chile
                    </span>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-[#141414] border border-[#2A2A2A] p-4">
                  <p className="text-xs text-[#9A9A8A] font-inter leading-relaxed">
                    <span className="text-[#C9A84C] font-mono">Nota:</span> DZ Metals
                    atiende exclusivamente operaciones de intermediación de metales y
                    minerales. No ofrecemos asesoría de inversión financiera ni
                    servicios no relacionados con el sector minero.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
