import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import UserStatusSelect from "@/components/admin/UserStatusSelect";

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: "bg-yellow-900/30 text-yellow-400 border border-yellow-700/40",
    active: "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40",
    rejected: "bg-red-900/30 text-red-400 border border-red-700/40",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${config[status] ?? "bg-gray-800 text-gray-400"}`}>
      {status}
    </span>
  );
}

export default async function AdminBuyersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: statusFilter = "all" } = await searchParams;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  let query = supabaseAdmin
    .from("users")
    .select(`
      id, full_name, email, country, status, created_at,
      buyer_profiles(metals_interested, quantity_needed_kg, destination_country, payment_method)
    `)
    .eq("role", "buyer")
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: buyers } = await query;

  const tabs = [
    { label: "Todos", value: "all" },
    { label: "Pendientes", value: "pending" },
    { label: "Aprobados", value: "active" },
    { label: "Rechazados", value: "rejected" },
  ];

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Compradores</h1>
          <p className="text-gray-500 mt-1">{buyers?.length ?? 0} registros</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#141414] border border-[#2a2a2a] rounded-lg p-1 mb-6 w-fit">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/buyers" : `/admin/buyers?status=${tab.value}`}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              statusFilter === tab.value
                ? "bg-[#C9A84C] text-[#0A0A0A]"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2a2a2a] bg-[#1a1a1a]">
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">País</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Metal</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad (kg)</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {(buyers ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-600">
                    No hay compradores con este filtro
                  </td>
                </tr>
              ) : (
                (buyers ?? []).map((buyer) => {
                  const profile = Array.isArray(buyer.buyer_profiles)
                    ? buyer.buyer_profiles[0]
                    : buyer.buyer_profiles;
                  return (
                    <tr key={buyer.id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/admin/buyers/${buyer.id}`} className="group">
                          <p className="text-white text-sm font-medium group-hover:text-[#C9A84C] transition-colors">
                            {buyer.full_name}
                          </p>
                          <p className="text-gray-500 text-xs">{buyer.email}</p>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{buyer.country}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm capitalize">
                        {profile?.metals_interested?.join(", ") ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">
                        {profile?.quantity_needed_kg?.toLocaleString() ?? "—"}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={buyer.status} />
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-sm">
                        {new Date(buyer.created_at).toLocaleDateString("es-CL")}
                      </td>
                      <td className="px-6 py-4">
                        <UserStatusSelect userId={buyer.id} currentStatus={buyer.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
