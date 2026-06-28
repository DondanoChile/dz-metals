interface SiteStats {
  totalVolumeTons?: string | number | null;
  countriesCount?: number | null;
  yearsExperience?: number | null;
  operationsClosed?: number | null;
}

interface StatsSectionProps {
  stats: SiteStats | null;
}

function formatVolume(tons: string | number | null | undefined): string {
  if (!tons) return "—";
  const n = typeof tons === "string" ? parseFloat(tons) : tons;
  return n.toLocaleString("es-CL") + " t";
}

interface StatCard {
  value: string;
  label: string;
  sublabel?: string;
}

function StatCard({ value, label, sublabel }: StatCard) {
  return (
    <div className="flex flex-col items-center sm:items-start gap-2 p-6 border-t-2 border-[#C9A84C]/40 bg-[#141414]">
      <span className="font-cormorant text-5xl sm:text-6xl font-semibold text-[#C9A84C] leading-none tabular-nums">
        {value}
      </span>
      <span className="text-sm font-inter text-[#F5F0E8] tracking-wide">
        {label}
      </span>
      {sublabel && (
        <span className="text-xs font-inter text-[#9A9A8A]">{sublabel}</span>
      )}
    </div>
  );
}

export default function StatsSection({ stats }: StatsSectionProps) {
  const cards: StatCard[] = [
    {
      value: formatVolume(stats?.totalVolumeTons),
      label: "Volumen intermediado",
      sublabel: "en operaciones cerradas",
    },
    {
      value: stats?.countriesCount ? `${stats.countriesCount}+` : "—",
      label: "Países activos",
      sublabel: "compradores y vendedores",
    },
    {
      value: stats?.yearsExperience ? `${stats.yearsExperience}+` : "—",
      label: "Años de experiencia",
      sublabel: "en el sector minero",
    },
    {
      value: stats?.operationsClosed ? `${stats.operationsClosed.toLocaleString("es-CL")}` : "—",
      label: "Operaciones cerradas",
      sublabel: "con confidencialidad total",
    },
  ];

  return (
    <section className="py-16 border-t border-[#2A2A2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-px w-8 bg-[#C9A84C]/50" />
            <span className="text-xs font-mono tracking-[0.25em] text-[#C9A84C] uppercase">
              Resultados
            </span>
            <div className="h-px w-8 bg-[#C9A84C]/50" />
          </div>
          <h2 className="font-cormorant text-3xl sm:text-4xl font-semibold text-[#F5F0E8]">
            Trayectoria que respalda
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, i) => (
            <StatCard key={i} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
