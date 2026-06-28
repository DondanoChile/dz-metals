import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import OperationStatusBadge from "@/components/admin/OperationStatusBadge";
import OperationStatusSelect from "@/components/admin/OperationStatusSelect";
import NewOperationButton from "@/components/admin/NewOperationButton";

export default async function AdminOperationsPage({
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
    .from("operations")
    .select(`
      id, metal_type, quantity_kg, status, created_at,
      seller:users!operations_seller_id_fkey(full_name),
      buyer:users!operations_buyer_id_fkey(full_name)
    `)
    .order("created_at", { ascending: false });

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  const { data: operations } = await query;

  const tabs = [
    { label: "Todas", value: "all" },
    { label: "Nuevas", value: "new" },
    { label: "Contactado", value: "contacted" },
    { label: "NDA Enviado", value: "nda_sent" },
    { label: "Negociando", value: "negotiating" },
    { label: "Cerradas", value: "closed" },
  ];

  return (
    <div className="max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Operaciones</h1>
          <p className="text-gray-500 mt-1">{operations?.length ?? 0} operaciones</p>
        </div>
        <NewOperationButton />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#141414] border border-[#2a2a2a] rounded-lg p-1 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === "all" ? "/admin/operations" : `/admin/operations?status=${tab.value}`}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
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
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Metal</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Vendedor</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Comprador</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cantidad (kg)</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Cambiar estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {(operations ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-600">
                    No hay operaciones con este filtro
                  </td>
                </tr>
              ) : (
                (operations ?? []).map((op) => (
                  <tr key={op.id} className="hover:bg-[#1a1a1a] transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/operations/${op.id}`} className="group">
                        <p className="text-white text-sm font-medium capitalize group-hover:text-[#C9A84C] transition-colors">
                          {op.metal_type}
                        </p>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {(op.seller as unknown as { full_name: string } | null)?.full_name ?? "—"}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {(op.buyer as unknown as { full_name: string } | null)?.full_name ?? (
                        <span className="text-gray-600 italic">Sin asignar</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <OperationStatusBadge status={op.status} />
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {op.quantity_kg?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {new Date(op.created_at).toLocaleDateString("es-CL")}
                    </td>
                    <td className="px-6 py-4">
                      <OperationStatusSelect operationId={op.id} currentStatus={op.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
