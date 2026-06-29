import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

function StatCard({
  label,
  value,
  href,
  accent = false,
}: {
  label: string;
  value: number;
  href?: string;
  accent?: boolean;
}) {
  const content = (
    <div
      className={`bg-[#141414] border rounded-xl p-6 ${
        accent ? "border-[#C9A84C]/30" : "border-[#2a2a2a]"
      } ${href ? "hover:border-[#C9A84C]/50 transition-colors cursor-pointer" : ""}`}
    >
      <p className="text-gray-500 text-sm mb-2">{label}</p>
      <p
        className={`font-bold text-4xl ${accent ? "text-[#C9A84C]" : "text-white"}`}
        style={{ fontFamily: "var(--font-cormorant), serif" }}
      >
        {value}
      </p>
    </div>
  );

  if (href) return <Link href={href}>{content}</Link>;
  return content;
}

export default async function AdminDashboardPage() {
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const [
    { count: pendingBuyers },
    { count: pendingSellers },
    { count: activeOps },
    { data: recentUsers },
    { data: recentOps },
  ] = await Promise.all([
    supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "buyer")
      .eq("status", "pending"),
    supabaseAdmin
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("role", "seller")
      .eq("status", "pending"),
    supabaseAdmin
      .from("operations")
      .select("*", { count: "exact", head: true })
      .not("status", "in", '("closed","cancelled")'),
    supabaseAdmin
      .from("users")
      .select("id, full_name, email, role, status, created_at")
      .not("role", "eq", "admin")
      .order("created_at", { ascending: false })
      .limit(8),
    supabaseAdmin
      .from("operations")
      .select("id, metal_type, quantity_kg, status, created_at, seller:users!operations_seller_id_fkey(full_name)")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const STATUS_LABEL: Record<string, string> = {
    pending: "Pendiente",
    active: "Aprobado",
    rejected: "Rechazado",
  };

  const STATUS_CLS: Record<string, string> = {
    pending: "bg-yellow-900/30 text-yellow-400",
    active: "bg-emerald-900/30 text-emerald-400",
    rejected: "bg-red-900/30 text-red-400",
  };

  const ROLE_LABEL: Record<string, string> = {
    buyer: "Comprador",
    seller: "Vendedor",
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Resumen general del sistema</p>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard
          label="Vendedores pendientes"
          value={pendingSellers ?? 0}
          href="/admin/sellers?status=pending"
          accent={(pendingSellers ?? 0) > 0}
        />
        <StatCard
          label="Compradores pendientes"
          value={pendingBuyers ?? 0}
          href="/admin/buyers?status=pending"
          accent={(pendingBuyers ?? 0) > 0}
        />
        <StatCard
          label="Operaciones activas"
          value={activeOps ?? 0}
          href="/admin/operations"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent registrations */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <h2 className="text-white font-semibold">Registros recientes</h2>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {(recentUsers ?? []).length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-600 text-sm">Sin registros</div>
            ) : (
              (recentUsers ?? []).map((u) => (
                <Link
                  key={u.id}
                  href={`/admin/${u.role === "seller" ? "sellers" : "buyers"}/${u.id}`}
                  className="px-6 py-3 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors block"
                >
                  <div>
                    <p className="text-white text-sm font-medium">{u.full_name}</p>
                    <p className="text-gray-500 text-xs">{u.email}</p>
                  </div>
                  <div className="text-right flex flex-col items-end gap-1">
                    <span className={`inline-block text-xs px-2 py-0.5 rounded-full ${STATUS_CLS[u.status] ?? "bg-gray-800 text-gray-400"}`}>
                      {STATUS_LABEL[u.status] ?? u.status}
                    </span>
                    <span className="text-gray-600 text-xs">{ROLE_LABEL[u.role] ?? u.role}</span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Recent operations */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <h2 className="text-white font-semibold">Operaciones recientes</h2>
            <Link href="/admin/operations" className="text-[#C9A84C] text-xs hover:underline">
              Ver todas
            </Link>
          </div>
          <div className="divide-y divide-[#2a2a2a]">
            {(recentOps ?? []).length === 0 ? (
              <div className="px-6 py-8 text-center text-gray-600 text-sm">Sin operaciones</div>
            ) : (
              (recentOps ?? []).map((op) => (
                <Link
                  key={op.id}
                  href={`/admin/operations/${op.id}`}
                  className="px-6 py-3 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors block"
                >
                  <div>
                    <p className="text-white text-sm font-medium capitalize">{op.metal_type}</p>
                    <p className="text-gray-500 text-xs">
                      {(op.seller as unknown as { full_name: string } | null)?.full_name ?? "Sin vendedor"} — {op.quantity_kg?.toLocaleString()} kg
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    op.status === "closed" ? "bg-green-900/30 text-green-400"
                    : op.status === "new" ? "bg-gray-800 text-gray-400"
                    : "bg-blue-900/30 text-blue-400"
                  }`}>
                    {op.status}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
