import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import Link from "next/link";
import { ClipboardList, PhoneCall, Handshake, ChevronDown } from "lucide-react";

export const metadata = {
  title: "Cómo Funciona | DZ Metals",
  description:
    "Proceso de intermediación en 3 pasos: registro, contacto del broker y negociación privada.",
};

const STEPS = [
  {
    number: "01",
    Icon: ClipboardList,
    title: "Regístrate",
    summary: "Completa el formulario de registro indicando si eres comprador o vendedor.",
    details: [
      "Selecciona tu perfil: comprador o vendedor.",
      "Indica el metal o mineral de interés y las cantidades aproximadas.",
      "Proporciona tu información de contacto y empresa.",
      "Adjunta documentos de respaldo si los tienes disponibles (opcional en esta etapa).",
      "El registro es gratuito y confidencial.",
    ],
  },
  {
    number: "02",
    Icon: PhoneCall,
    title: "Te Contactamos",
    summary: "Un broker asignado revisará tu solicitud y se pondrá en contacto contigo dentro de 24 horas hábiles.",
    details: [
      "Revisamos la viabilidad de la operación según el mercado actual.",
      "El broker te contacta por teléfono, WhatsApp o email según tu preferencia.",
      "Se establece un NDA (acuerdo de confidencialidad) si corresponde.",
      "Se solicitan documentos adicionales: RUT/RUC, representación legal, certificados de origen.",
      "No existe compromiso de pago en esta etapa.",
    ],
  },
  {
    number: "03",
    Icon: Handshake,
    title: "Negociamos",
    summary: "El broker gestiona la negociación directa entre las partes, protegiendo la identidad de ambas.",
    details: [
      "El broker presenta ofertas y contraofertas sin revelar la identidad de las partes.",
      "Se fijan condiciones: precio, volumen, forma de pago, entrega y verificación.",
      "Una vez acordado, se firman los contratos con la intermediación de DZ Metals.",
      "El broker acompaña el proceso hasta el cierre efectivo de la operación.",
      "Se emite documentación de trazabilidad conforme a la normativa vigente.",
    ],
  },
];

const FAQS = [
  {
    q: "¿Cuánto cuesta el servicio de intermediación?",
    a: "DZ Metals cobra una comisión de intermediación que se define caso a caso según el volumen y tipo de operación. La comisión es acordada por escrito antes del inicio del proceso formal de negociación. El registro inicial es completamente gratuito.",
  },
  {
    q: "¿El comprador y el vendedor se contactan directamente?",
    a: "No. DZ Metals actúa como broker intermediario durante todo el proceso. Las partes no intercambian información de contacto ni identidad hasta que la operación está completamente cerrada, documentada y garantizada. Esta confidencialidad es uno de nuestros compromisos fundamentales.",
  },
  {
    q: "¿Qué documentación se requiere para operar?",
    a: "Para vendedores: guía de despacho minero, certificado de ley (análisis de laboratorio), declaración de origen, y RUT/RUC de la empresa. Para compradores: identificación empresarial, capacidad de pago demostrable y destino de uso del material. El listado exacto varía según el metal y el volumen.",
  },
  {
    q: "¿Operan con particulares o solo con empresas?",
    a: "Principalmente operamos con empresas y personas jurídicas. Podemos evaluar casos de personas naturales con actividad minera formal, pero se requiere documentación adicional y la operación debe ser de un volumen mínimo significativo.",
  },
  {
    q: "¿Qué pasa si no se cierra la operación?",
    a: "Si tras el proceso de negociación las partes no llegan a un acuerdo, no se genera ningún cargo para ninguna de ellas. DZ Metals solo percibe su comisión cuando la operación se cierra efectivamente. No existe penalización por retiro durante la negociación.",
  },
];

export default function ProcessPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-20 border-b border-[#2A2A2A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-[#C9A84C]/50" />
                <span className="text-xs font-mono tracking-[0.25em] text-[#C9A84C] uppercase">
                  Proceso
                </span>
              </div>
              <h1 className="font-cormorant text-5xl sm:text-6xl font-semibold text-[#F5F0E8] leading-tight mb-6">
                Cómo funciona
              </h1>
              <p className="text-base text-[#9A9A8A] font-inter leading-relaxed">
                La intermediación de metales requiere discreción, documentación y un
                protocolo claro. Nuestro proceso de 3 pasos garantiza que tanto
                compradores como vendedores estén protegidos en todo momento.
              </p>
            </div>
          </div>
        </section>

        {/* Detailed steps */}
        <section className="py-20 border-b border-[#2A2A2A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
            {STEPS.map(({ number, Icon, title, summary, details }) => (
              <div
                key={number}
                className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-8 border-b border-[#2A2A2A] pb-12 last:border-0 last:pb-0"
              >
                {/* Step indicator */}
                <div className="flex lg:flex-col items-center lg:items-start gap-4">
                  <div className="w-16 h-16 flex items-center justify-center bg-[#141414] border border-[#2A2A2A]">
                    <Icon size={20} className="text-[#C9A84C]" />
                  </div>
                  <span className="font-cormorant text-5xl font-semibold text-[#C9A84C]/30">
                    {number}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-col gap-4">
                  <h2 className="font-cormorant text-3xl font-semibold text-[#F5F0E8]">
                    {title}
                  </h2>
                  <p className="text-base text-[#9A9A8A] font-inter leading-relaxed">
                    {summary}
                  </p>
                  <ul className="flex flex-col gap-3 mt-2">
                    {details.map((d) => (
                      <li
                        key={d}
                        className="flex items-start gap-3 text-sm text-[#F5F0E8] font-inter"
                      >
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#C9A84C] shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Privacy emphasis */}
        <section className="py-16 border-b border-[#2A2A2A] bg-[#141414]">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="h-px w-16 bg-[#C9A84C]/40 mx-auto mb-6" />
            <h2 className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#F5F0E8] mb-4">
              Privacidad total del broker
            </h2>
            <p className="text-sm text-[#9A9A8A] font-inter leading-relaxed">
              DZ Metals controla el flujo de información en todo momento. El
              comprador no conoce al vendedor, y viceversa, hasta el cierre formal.
              Esta estructura protege ambos intereses y elimina el riesgo de
              acuerdos paralelos que dejen fuera al intermediario.
            </p>
            <div className="h-px w-16 bg-[#C9A84C]/40 mx-auto mt-6" />
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="h-px w-8 bg-[#C9A84C]/50" />
                <span className="text-xs font-mono tracking-[0.25em] text-[#C9A84C] uppercase">
                  FAQ
                </span>
                <div className="h-px w-8 bg-[#C9A84C]/50" />
              </div>
              <h2 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[#F5F0E8]">
                Preguntas frecuentes
              </h2>
            </div>

            <div className="flex flex-col divide-y divide-[#2A2A2A]">
              {FAQS.map(({ q, a }) => (
                <details key={q} className="group py-5 cursor-pointer list-none">
                  <summary className="flex items-center justify-between gap-4 list-none">
                    <span className="font-inter text-sm font-medium text-[#F5F0E8]">
                      {q}
                    </span>
                    <ChevronDown
                      size={16}
                      className="text-[#C9A84C] shrink-0 group-open:rotate-180 transition-transform duration-200"
                    />
                  </summary>
                  <p className="mt-4 text-sm text-[#9A9A8A] font-inter leading-relaxed">
                    {a}
                  </p>
                </details>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-14 text-center">
              <p className="text-sm text-[#9A9A8A] font-inter mb-6">
                ¿Listo para iniciar el proceso?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register/buyer"
                  className="px-8 py-3 bg-[#C9A84C] text-[#0A0A0A] font-inter text-sm font-medium tracking-wide hover:bg-[#b8973d] transition-colors"
                >
                  Soy Comprador
                </Link>
                <Link
                  href="/register/seller"
                  className="px-8 py-3 border border-[#C9A84C] text-[#C9A84C] font-inter text-sm font-medium tracking-wide hover:bg-[#C9A84C]/10 transition-colors"
                >
                  Soy Vendedor
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
