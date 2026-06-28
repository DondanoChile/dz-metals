import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { Shield, Scale, Eye, Globe, Award, Users } from "lucide-react";

export const metadata = {
  title: "Sobre Nosotros | DZ Metals",
  description:
    "Somos un intermediario privado de metales y minerales con base en Chile y alcance internacional.",
};

export default function AboutPage() {
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
                  Sobre Nosotros
                </span>
              </div>
              <h1 className="font-cormorant text-5xl sm:text-6xl font-semibold text-[#F5F0E8] leading-tight mb-6">
                Intermediación privada con{" "}
                <span className="text-[#C9A84C]">experiencia real</span>
              </h1>
              <p className="text-base text-[#9A9A8A] font-inter leading-relaxed">
                DZ Metals es una empresa chilena de intermediación en la compra y
                venta de metales y minerales. Actuamos exclusivamente como brokers:
                no compramos ni vendemos por cuenta propia, sino que conectamos a
                compradores y vendedores de forma privada, profesional y trazable.
              </p>
            </div>
          </div>
        </section>

        {/* Quiénes somos */}
        <section className="py-20 border-b border-[#2A2A2A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[#F5F0E8] mb-6">
                  ¿Quiénes somos?
                </h2>
                <div className="flex flex-col gap-4 text-sm text-[#9A9A8A] font-inter leading-relaxed">
                  <p>
                    Con sede en Santiago de Chile, DZ Metals opera como intermediario
                    independiente en el mercado de commodities mineros. Nuestra red abarca
                    productores, refinerías y compradores en América Latina, Europa y Asia.
                  </p>
                  <p>
                    Cada operación es gestionada de forma directa por un broker
                    asignado, quien mantiene la confidencialidad de ambas partes durante
                    todo el proceso. El comprador y el vendedor no interactúan entre sí
                    hasta que la operación está completamente cerrada y garantizada.
                  </p>
                  <p>
                    Trabajamos con metales precisos (oro, plata, cobre refinado) y
                    materiales en distintas formas: colpa, concentrado, doré, polvo y
                    producto refinado.
                  </p>
                </div>
              </div>

              {/* Visual element */}
              <div className="relative h-64 lg:h-80 bg-[#141414] border border-[#2A2A2A] flex items-center justify-center">
                <div className="text-center">
                  <div className="font-cormorant text-6xl font-semibold text-[#C9A84C] mb-2">
                    DZ
                  </div>
                  <div className="h-px w-16 bg-[#C9A84C]/40 mx-auto mb-2" />
                  <div className="text-xs font-mono tracking-[0.3em] text-[#9A9A8A] uppercase">
                    Metals Broker
                  </div>
                </div>
                {/* Corner accents */}
                {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map(
                  (pos) => (
                    <div
                      key={pos}
                      className={`absolute ${pos} w-4 h-4 border border-[#C9A84C]/40`}
                    />
                  )
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-20 border-b border-[#2A2A2A] bg-[#141414]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[#F5F0E8]">
                Nuestros valores
              </h2>
              <p className="mt-3 text-sm text-[#9A9A8A] font-inter max-w-xl mx-auto">
                Los principios que guían cada operación que llevamos adelante.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                {
                  Icon: Shield,
                  title: "Confidencialidad",
                  description:
                    "La identidad de compradores y vendedores se mantiene protegida en todo momento. Solo el broker conoce a ambas partes.",
                },
                {
                  Icon: Scale,
                  title: "Profesionalismo",
                  description:
                    "Cada operación sigue un protocolo riguroso: documentación, verificación y seguimiento hasta el cierre.",
                },
                {
                  Icon: Eye,
                  title: "Trazabilidad",
                  description:
                    "Registramos el origen y destino de cada metal o mineral intermediado, cumpliendo con las normas chilenas e internacionales.",
                },
              ].map(({ Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-[#0A0A0A] border border-[#2A2A2A] p-6 flex flex-col gap-4"
                >
                  <div className="w-10 h-10 flex items-center justify-center bg-[#C9A84C]/10">
                    <Icon size={18} className="text-[#C9A84C]" />
                  </div>
                  <h3 className="font-cormorant text-xl font-semibold text-[#F5F0E8]">
                    {title}
                  </h3>
                  <p className="text-sm text-[#9A9A8A] font-inter leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Por qué elegirnos */}
        <section className="py-20 border-b border-[#2A2A2A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14">
              <h2 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[#F5F0E8]">
                ¿Por qué elegirnos?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  Icon: Globe,
                  title: "Alcance internacional",
                  description:
                    "Nuestra red activa conecta compradores en Asia y Europa con productores en Sudamérica, con experiencia en regulaciones de múltiples jurisdicciones.",
                },
                {
                  Icon: Award,
                  title: "Operaciones verificadas",
                  description:
                    "No intermediamos sin documentación. Exigimos y verificamos guías de despacho, certificados de calidad y declaraciones de origen.",
                },
                {
                  Icon: Users,
                  title: "Trato directo con broker",
                  description:
                    "No hay call centers ni bots. Cada cliente tiene un broker asignado que lo acompaña desde el registro hasta el cierre de la operación.",
                },
              ].map(({ Icon, title, description }) => (
                <div key={title} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Icon size={18} className="text-[#C9A84C]" />
                    </div>
                    <h3 className="font-cormorant text-xl font-semibold text-[#F5F0E8]">
                      {title}
                    </h3>
                  </div>
                  <div className="h-px w-full bg-[#2A2A2A]" />
                  <p className="text-sm text-[#9A9A8A] font-inter leading-relaxed">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
