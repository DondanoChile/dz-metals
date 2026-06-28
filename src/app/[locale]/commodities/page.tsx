import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export const metadata = {
  title: "Metales y Minerales | DZ Metals",
  description:
    "Intermediación en oro, cobre, plata, molibdeno, sal y otros minerales. Conozca las formas y pureza con las que operamos.",
};

interface CommodityDetail {
  name: string;
  symbol: string;
  description: string;
  purity: string[];
  forms: string[];
  uses: string[];
  lmeNote: string;
  color: string;
}

const COMMODITIES: CommodityDetail[] = [
  {
    name: "Oro",
    symbol: "XAU",
    description:
      "Metal precioso por excelencia. Chile es un productor relevante a nivel mundial. DZ Metals intermedia oro en distintas formas, desde doré hasta barras refinadas, con verificación de ley y origen.",
    purity: ["Au 999.9 (24k refinado)", "Au 916 (22k)", "Doré 70–90% Au", "Colpa variable"],
    forms: ["Barra refinada", "Doré", "Colpa", "Concentrado aurífero"],
    uses: ["Joyería y orfebrería", "Reserva de valor (bancos centrales)", "Electrónica de precisión", "Aplicaciones médicas"],
    lmeNote: "Precio referencia: London Bullion Market Association (LBMA). Cotización en USD/oz t.",
    color: "#C9A84C",
  },
  {
    name: "Cobre",
    symbol: "XCU",
    description:
      "Chile es el mayor productor mundial de cobre. Intermediamos cátodos, concentrados y barras de cobre, principalmente para exportación a mercados asiáticos y europeos.",
    purity: ["Cátodo Cu 99.99%", "Concentrado 25–35% Cu", "Chatarra Cu ≥ 90%"],
    forms: ["Cátodo electrolítico (LME Grade A)", "Concentrado de cobre", "Alambrón", "Chatarra"],
    uses: ["Cables y conductores eléctricos", "Construcción e infraestructura", "Motores y transformadores", "Vehículos eléctricos"],
    lmeNote: "Precio referencia: London Metal Exchange (LME). Cotización en USD/t.",
    color: "#B87333",
  },
  {
    name: "Plata",
    symbol: "XAG",
    description:
      "Metal precioso con fuerte demanda industrial. La intermediación de plata suele asociarse a operaciones de cobre o como subproducto aurífero. También operamos plata pura refinada.",
    purity: ["Ag 999 (fino)", "Ag 925 (sterling)", "Doré con Ag variable"],
    forms: ["Lingote refinado", "Doré", "Gránulo", "Polvo de plata"],
    uses: ["Paneles solares fotovoltaicos", "Fotografía y ótica", "Joyería y cubertería", "Electrónica y semiconductores"],
    lmeNote: "Precio referencia: LBMA. Cotización en USD/oz t.",
    color: "#C0C0C0",
  },
  {
    name: "Molibdeno",
    symbol: "MO",
    description:
      "Metal estratégico obtenido principalmente como subproducto del cobre en Chile. Esencial para la industria del acero de alta resistencia. DZ Metals conecta productores con compradores industriales especializados.",
    purity: ["MoO₃ técnico ≥ 57% Mo", "Ferromolibdeno 60–70% Mo"],
    forms: ["Óxido de molibdeno (MoO₃)", "Ferromolibdeno (FeMo)", "Concentrado de molibdeno"],
    uses: ["Acero inoxidable y de alta resistencia", "Catalizadores de refinería de petróleo", "Superaleaciones para aeronáutica", "Electrónica y lubricantes"],
    lmeNote: "Precio referencia: Metal Bulletin / Platt's. Mercado OTC, no LME oficial.",
    color: "#9A9A8A",
  },
  {
    name: "Sal",
    symbol: "—",
    description:
      "Chile posee salares de clase mundial, en especial en el norte (Atacama, Tarapacá). Intermediamos cloruro de sodio y sales industriales para uso químico, alimentario y vial.",
    purity: ["NaCl ≥ 99.5% (grado alimentario)", "NaCl ≥ 97% (grado industrial)", "Sales de litio (consultar)"],
    forms: ["Sal granulada", "Sal molida fina", "Flor de sal", "Bloques industriales"],
    uses: ["Industria química (cloro-álcali)", "Alimentación humana y animal", "Tratamiento de agua", "Industria de hielo y refrigeración"],
    lmeNote: "Mercado privado. La sal no cotiza en LME. Precio por negociación directa.",
    color: "#F5F0E8",
  },
  {
    name: "Otros Minerales",
    symbol: "VAR",
    description:
      "Además de los metales principales, DZ Metals puede intermediar otros minerales industriales y estratégicos disponibles en Chile y la región, previa evaluación de cada operación.",
    purity: ["Variable según mineral y especificación del comprador"],
    forms: ["Concentrado", "Mineral crudo", "Producto refinado", "Forma según requerimiento"],
    uses: ["Industria química", "Construcción", "Agricultura (fertilizantes)", "Manufactura especializada"],
    lmeNote: "Precio por negociación directa según las condiciones del mercado al momento de la operación.",
    color: "#C9A84C",
  },
];

export default function CommoditiesPage() {
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
                  Portafolio
                </span>
              </div>
              <h1 className="font-cormorant text-5xl sm:text-6xl font-semibold text-[#F5F0E8] leading-tight mb-6">
                Metales y Minerales
              </h1>
              <p className="text-base text-[#9A9A8A] font-inter leading-relaxed max-w-2xl">
                Operamos como broker en una selección de commodities mineros con
                demanda real en el mercado internacional. Cada metal tiene sus
                propias formas comerciales, rangos de pureza y referencias de precio.
              </p>
            </div>
          </div>
        </section>

        {/* Commodity detail cards */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-12">
            {COMMODITIES.map((c, i) => (
              <div
                key={c.symbol}
                className="bg-[#141414] border border-[#2A2A2A] rounded overflow-hidden"
              >
                {/* Card header */}
                <div
                  className="px-6 py-5 border-b border-[#2A2A2A] flex items-center justify-between"
                  style={{ borderTopColor: c.color, borderTopWidth: 2 }}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className="font-cormorant text-4xl font-semibold leading-none"
                      style={{ color: c.color }}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <h2 className="font-cormorant text-2xl sm:text-3xl font-semibold text-[#F5F0E8]">
                        {c.name}
                      </h2>
                      <span className="text-xs font-mono text-[#9A9A8A] tracking-widest">
                        {c.symbol}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Description + LME note */}
                  <div className="lg:col-span-1 flex flex-col gap-4">
                    <p className="text-sm text-[#9A9A8A] font-inter leading-relaxed">
                      {c.description}
                    </p>
                    <div className="mt-auto p-3 bg-[#0A0A0A] border border-[#2A2A2A] text-xs font-mono text-[#9A9A8A] leading-relaxed">
                      {c.lmeNote}
                    </div>
                  </div>

                  {/* Pureza */}
                  <div>
                    <h3 className="text-xs font-mono tracking-widest text-[#C9A84C] uppercase mb-3">
                      Rangos de Pureza
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {c.purity.map((p) => (
                        <li
                          key={p}
                          className="flex items-start gap-2 text-sm text-[#F5F0E8] font-inter"
                        >
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A84C]/60 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>

                    <h3 className="text-xs font-mono tracking-widest text-[#C9A84C] uppercase mb-3 mt-6">
                      Formas Comerciales
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {c.forms.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-sm text-[#F5F0E8] font-inter"
                        >
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A84C]/60 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Usos */}
                  <div>
                    <h3 className="text-xs font-mono tracking-widest text-[#C9A84C] uppercase mb-3">
                      Principales Usos
                    </h3>
                    <ul className="flex flex-col gap-2">
                      {c.uses.map((u) => (
                        <li
                          key={u}
                          className="flex items-start gap-2 text-sm text-[#F5F0E8] font-inter"
                        >
                          <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A84C]/60 shrink-0" />
                          {u}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
