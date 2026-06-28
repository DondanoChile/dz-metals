import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { ExternalLink, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Marco Legal y Cumplimiento | DZ Metals",
  description:
    "Marco normativo aplicable a la intermediación de metales en Chile. SERNAGEOMIN, Ley 20.393, UAF y due diligence.",
};

export default function LegalPage() {
  return (
    <>
      <Header />
      <main className="pt-20">
        {/* Hero */}
        <section className="py-16 border-b border-[#2A2A2A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-8 bg-[#C9A84C]/50" />
                <span className="text-xs font-mono tracking-[0.25em] text-[#C9A84C] uppercase">
                  Legal
                </span>
              </div>
              <h1 className="font-cormorant text-5xl sm:text-6xl font-semibold text-[#F5F0E8] leading-tight mb-6">
                Marco Legal y Cumplimiento
              </h1>
              <p className="text-base text-[#9A9A8A] font-inter leading-relaxed">
                DZ Metals opera dentro del marco legal chileno aplicable a la
                intermediación de minerales y metales. Esta página resume los
                principales cuerpos normativos que rigen nuestra actividad.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer banner */}
        <div className="bg-[#141414] border-b border-[#2A2A2A] py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-[#C9A84C] shrink-0 mt-0.5" />
              <p className="text-xs text-[#9A9A8A] font-inter leading-relaxed">
                <span className="text-[#C9A84C] font-mono">Aviso importante:</span>{" "}
                La información contenida en esta página es de carácter referencial e
                informativo. No constituye asesoría legal. Para consultas específicas,
                recomendamos acudir a un abogado especializado en derecho minero chileno.
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-16">

            {/* SERNAGEOMIN */}
            <div id="sernageomin" className="flex flex-col gap-6">
              <div className="border-l-2 border-[#C9A84C] pl-5">
                <h2 className="font-cormorant text-3xl font-semibold text-[#F5F0E8]">
                  Marco SERNAGEOMIN
                </h2>
                <p className="text-sm text-[#9A9A8A] font-mono mt-1">
                  Servicio Nacional de Geología y Minería
                </p>
              </div>
              <div className="text-sm text-[#9A9A8A] font-inter leading-relaxed flex flex-col gap-4">
                <p>
                  El SERNAGEOMIN es el organismo técnico del Estado de Chile responsable
                  de la regulación y supervisión de las actividades geológicas y mineras.
                  Como intermediario, DZ Metals requiere que todos los materiales
                  intermediados cuenten con la documentación de origen válida conforme a
                  la normativa de SERNAGEOMIN.
                </p>
                <p>
                  Esto incluye la <strong className="text-[#F5F0E8]">guía de operaciones mineras</strong> para
                  el transporte de minerales y la verificación de que el vendedor cuente
                  con concesión o permiso vigente según corresponda al tipo de mineral y
                  su condición (artesanal, mediana o gran minería).
                </p>
                <ul className="flex flex-col gap-2 mt-2">
                  {[
                    "D.S. N°72/1985 — Reglamento de Seguridad Minera",
                    "Ley N°18.248 — Código de Minería de Chile",
                    "D.S. N°148/2003 — Manejo de residuos peligrosos (aplicable a relaves y concentrados)",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#F5F0E8] font-inter">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A84C] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.sernageomin.cl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#C9A84C] hover:underline mt-2"
                >
                  sernageomin.cl
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div className="h-px bg-[#2A2A2A]" />

            {/* Ley 20.393 */}
            <div id="ley20393" className="flex flex-col gap-6">
              <div className="border-l-2 border-[#C9A84C] pl-5">
                <h2 className="font-cormorant text-3xl font-semibold text-[#F5F0E8]">
                  Ley 20.393 — Responsabilidad Penal de Personas Jurídicas
                </h2>
                <p className="text-sm text-[#9A9A8A] font-mono mt-1">
                  Lavado de activos, financiamiento del terrorismo y soborno
                </p>
              </div>
              <div className="text-sm text-[#9A9A8A] font-inter leading-relaxed flex flex-col gap-4">
                <p>
                  La Ley 20.393 establece la responsabilidad penal de las personas
                  jurídicas en Chile por los delitos de lavado de activos, financiamiento
                  del terrorismo y cohecho a funcionario público. DZ Metals, como persona
                  jurídica dedicada a la intermediación de alto valor, tiene la obligación
                  de implementar un Modelo de Prevención de Delitos (MPD).
                </p>
                <p>
                  Nuestro modelo de cumplimiento incluye:
                </p>
                <ul className="flex flex-col gap-2">
                  {[
                    "Designación de un Encargado de Prevención",
                    "Identificación y evaluación de riesgos por tipo de operación",
                    "Procedimientos de debida diligencia sobre clientes y contrapartes",
                    "Canales de denuncia internos",
                    "Capacitación periódica del equipo",
                    "Revisión y actualización anual del MPD",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#F5F0E8] font-inter">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A84C] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.bcn.cl/leychile/navegar?idNorma=1008668"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#C9A84C] hover:underline mt-2"
                >
                  Ley 20.393 en BCN
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div className="h-px bg-[#2A2A2A]" />

            {/* UAF */}
            <div id="uaf" className="flex flex-col gap-6">
              <div className="border-l-2 border-[#C9A84C] pl-5">
                <h2 className="font-cormorant text-3xl font-semibold text-[#F5F0E8]">
                  UAF — Unidad de Análisis Financiero
                </h2>
                <p className="text-sm text-[#9A9A8A] font-mono mt-1">
                  Prevención de lavado de activos en Chile
                </p>
              </div>
              <div className="text-sm text-[#9A9A8A] font-inter leading-relaxed flex flex-col gap-4">
                <p>
                  La Unidad de Análisis Financiero (UAF) es el organismo del Estado de
                  Chile encargado de prevenir y detectar el lavado de activos y el
                  financiamiento del terrorismo. Según la Ley 19.913 y sus modificaciones,
                  determinadas personas y entidades tienen la obligación de reportar
                  operaciones sospechosas a la UAF.
                </p>
                <p>
                  En el contexto de la intermediación de metales, DZ Metals aplica los
                  siguientes principios UAF:
                </p>
                <ul className="flex flex-col gap-2">
                  {[
                    "Conocimiento del cliente (KYC): verificación de identidad y actividad económica",
                    "Monitoreo de operaciones inusuales o inconsistentes con el perfil del cliente",
                    "Reporte de operaciones sospechosas (ROS) cuando corresponda",
                    "Conservación de registros por el período legal exigido",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-[#F5F0E8] font-inter">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A84C] shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://www.uaf.cl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-mono text-[#C9A84C] hover:underline mt-2"
                >
                  uaf.cl
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>

            <div className="h-px bg-[#2A2A2A]" />

            {/* Due Diligence */}
            <div id="due-diligence" className="flex flex-col gap-6">
              <div className="border-l-2 border-[#C9A84C] pl-5">
                <h2 className="font-cormorant text-3xl font-semibold text-[#F5F0E8]">
                  Declaración de Debida Diligencia
                </h2>
                <p className="text-sm text-[#9A9A8A] font-mono mt-1">
                  Due Diligence Declaration
                </p>
              </div>
              <div className="text-sm text-[#9A9A8A] font-inter leading-relaxed flex flex-col gap-4">
                <p>
                  DZ Metals aplica procedimientos de debida diligencia (due diligence)
                  sobre todas las partes involucradas en una operación de intermediación,
                  antes de iniciar cualquier proceso formal de negociación.
                </p>

                <div className="bg-[#141414] border border-[#2A2A2A] p-5 flex flex-col gap-3">
                  <h3 className="font-cormorant text-lg font-semibold text-[#F5F0E8]">
                    Para vendedores, verificamos:
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {[
                      "Identidad y personería jurídica de la empresa vendedora",
                      "Título minero o autorización para extraer/poseer el mineral",
                      "Certificados de análisis de calidad del material (ley, pureza)",
                      "Guías de despacho u otros documentos de trazabilidad",
                      "Antecedentes regulatorios (no figurar en listas de sanciones OFAC, ONU)",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-[#9A9A8A] font-inter">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A84C] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-[#141414] border border-[#2A2A2A] p-5 flex flex-col gap-3">
                  <h3 className="font-cormorant text-lg font-semibold text-[#F5F0E8]">
                    Para compradores, verificamos:
                  </h3>
                  <ul className="flex flex-col gap-2">
                    {[
                      "Identidad y razón social de la empresa compradora",
                      "Propósito declarado de uso del material",
                      "Capacidad financiera para la operación",
                      "País de destino del material y restricciones de exportación",
                      "Antecedentes regulatorios internacionales",
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-xs text-[#9A9A8A] font-inter">
                        <span className="mt-1.5 w-1 h-1 rounded-full bg-[#C9A84C] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <p className="mt-2 text-xs text-[#9A9A8A] font-mono leading-relaxed border border-[#2A2A2A] p-4">
                  DZ Metals se reserva el derecho de rechazar o suspender cualquier
                  operación que no pase satisfactoriamente el proceso de debida diligencia,
                  sin necesidad de explicar las razones al solicitante.
                </p>
              </div>
            </div>

            {/* Disclaimer final */}
            <div className="bg-[#141414] border border-[#C9A84C]/20 p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-[#C9A84C] shrink-0 mt-0.5" />
                <div className="flex flex-col gap-2">
                  <h3 className="font-cormorant text-lg font-semibold text-[#F5F0E8]">
                    Aviso de exención de responsabilidad
                  </h3>
                  <p className="text-xs text-[#9A9A8A] font-inter leading-relaxed">
                    La información contenida en esta página es referencial y fue redactada
                    con fines informativos. No constituye asesoría jurídica, tributaria ni
                    regulatoria. Las normas aquí descritas pueden estar sujetas a
                    modificaciones legislativas posteriores a la publicación de este
                    contenido. Para operaciones específicas, DZ Metals recomienda
                    consultar con abogados especializados en derecho minero y compliance
                    chileno.
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
