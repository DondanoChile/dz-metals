import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import OperationStatusBadge from "@/components/admin/OperationStatusBadge";
import BrokerNotesEditor from "@/components/admin/BrokerNotesEditor";
import RequestDocumentButton from "@/components/admin/RequestDocumentButton";
import AssignBuyerButton from "@/components/admin/AssignBuyerButton";

const STATUS_STEPS = ["new", "contacted", "nda_sent", "negotiating", "closed"];

function InfoRow({ label, value }: { label: string; value?: unknown }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-500 uppercase tracking-wide">{label}</span>
      <span className="text-white text-sm">{value != null ? String(value) : "—"}</span>
    </div>
  );
}

export default async function AdminOperationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: operation, error } = await supabaseAdmin
    .from("operations")
    .select(`
      *,
      seller:users!operations_seller_id_fkey(
        id, full_name, email, phone, country,
        seller_profiles(metal_type, metal_state, purity, humidity, quantity_kg, origin_country, origin_region, has_analysis, analysis_lab)
      ),
      buyer:users!operations_buyer_id_fkey(
        id, full_name, email, phone, country,
        buyer_profiles(metals_interested, quantity_needed_kg, payment_method)
      ),
      documents(*),
      document_requests(*)
    `)
    .eq("id", id)
    .single();

  if (error || !operation) notFound();

  const seller = operation.seller as Record<string, unknown> | null;
  const buyer = operation.buyer as Record<string, unknown> | null;
  const sellerProfile = Array.isArray((seller as Record<string, unknown> | null)?.seller_profiles)
    ? ((seller as Record<string, unknown>).seller_profiles as Record<string, unknown>[])[0]
    : (seller as Record<string, unknown> | null)?.seller_profiles as Record<string, unknown> | null;
  const buyerProfile = Array.isArray((buyer as Record<string, unknown> | null)?.buyer_profiles)
    ? ((buyer as Record<string, unknown>).buyer_profiles as Record<string, unknown>[])[0]
    : (buyer as Record<string, unknown> | null)?.buyer_profiles as Record<string, unknown> | null;

  const documents = (operation.documents as Record<string, unknown>[]) ?? [];
  const docsByType = documents.reduce<Record<string, Record<string, unknown>[]>>((acc, doc) => {
    const type = doc.doc_type as string;
    if (!acc[type]) acc[type] = [];
    acc[type].push(doc);
    return acc;
  }, {});

  const currentStepIndex = STATUS_STEPS.indexOf(operation.status);

  return (
    <div className="max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-white capitalize">{operation.metal_type}</h1>
            <OperationStatusBadge status={operation.status} />
          </div>
          <p className="text-gray-500">{operation.quantity_kg?.toLocaleString()} kg</p>
        </div>
      </div>

      {/* Status stepper */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
        <div className="flex items-center gap-0">
          {STATUS_STEPS.map((step, i) => {
            const isDone = i < currentStepIndex;
            const isCurrent = i === currentStepIndex;
            return (
              <div key={step} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      isDone
                        ? "bg-[#C9A84C] text-[#0A0A0A]"
                        : isCurrent
                        ? "bg-[#C9A84C]/20 border-2 border-[#C9A84C] text-[#C9A84C]"
                        : "bg-[#2a2a2a] text-gray-600"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </div>
                  <span className={`text-xs capitalize text-center ${isCurrent ? "text-[#C9A84C]" : isDone ? "text-gray-300" : "text-gray-600"}`}>
                    {step.replace("_", " ")}
                  </span>
                </div>
                {i < STATUS_STEPS.length - 1 && (
                  <div className={`h-0.5 flex-1 mx-1 mb-5 ${isDone ? "bg-[#C9A84C]" : "bg-[#2a2a2a]"}`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Seller + Buyer cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Seller card */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Vendedor</h2>
            <span className="text-xs text-gray-600 bg-[#2a2a2a] px-2 py-0.5 rounded">Seller</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="Nombre" value={seller?.full_name as string} />
            <InfoRow label="Email" value={seller?.email as string} />
            <InfoRow label="Teléfono" value={seller?.phone as string} />
            <InfoRow label="País" value={seller?.country as string} />
            <InfoRow label="Metal" value={sellerProfile?.metal_type as string} />
            <InfoRow label="Estado Metal" value={sellerProfile?.metal_state as string} />
            <InfoRow label="Pureza" value={sellerProfile?.purity != null ? `${sellerProfile.purity}%` : null} />
            <InfoRow label="Cantidad" value={sellerProfile?.quantity_kg ? `${(sellerProfile.quantity_kg as number).toLocaleString()} kg` : null} />
            <InfoRow label="Origen" value={sellerProfile?.origin_region && sellerProfile?.origin_country ? String(sellerProfile.origin_region) + ", " + String(sellerProfile.origin_country) : null} />
            <InfoRow label="Tiene análisis" value={sellerProfile?.has_analysis ? "Sí" : "No"} />
            {Boolean(sellerProfile?.analysis_lab) && (
              <InfoRow label="Laboratorio" value={sellerProfile?.analysis_lab} />
            )}
          </div>
        </div>

        {/* Buyer card */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Comprador</h2>
            {buyer ? (
              <span className="text-xs text-gray-600 bg-[#2a2a2a] px-2 py-0.5 rounded">Buyer</span>
            ) : (
              <AssignBuyerButton operationId={operation.id} />
            )}
          </div>
          {buyer ? (
            <div className="grid grid-cols-2 gap-4">
              <InfoRow label="Nombre" value={buyer.full_name as string} />
              <InfoRow label="Email" value={buyer.email as string} />
              <InfoRow label="Teléfono" value={buyer.phone as string} />
              <InfoRow label="País" value={buyer.country as string} />
              <InfoRow label="Metales interés" value={(buyerProfile?.metals_interested as string[])?.join(", ")} />
              <InfoRow label="Método de pago" value={buyerProfile?.payment_method as string} />
            </div>
          ) : (
            <div className="flex items-center justify-center h-32">
              <p className="text-gray-600 text-sm italic">No asignado</p>
            </div>
          )}
        </div>
      </div>

      {/* Documents */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white font-semibold">Documentos</h2>
          <RequestDocumentButton operationId={operation.id} sellerId={seller?.id as string} buyerId={buyer?.id as string | undefined} />
        </div>

        {Object.keys(docsByType).length === 0 ? (
          <p className="text-gray-600 text-sm text-center py-8">No hay documentos aún</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(docsByType).map(([type, docs]) => (
              <div key={type}>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">{type}</p>
                <div className="space-y-2">
                  {docs.map((doc) => (
                    <div key={doc.id as string} className="flex items-center justify-between bg-[#1a1a1a] rounded-lg px-4 py-3">
                      <div>
                        <p className="text-white text-sm">{doc.filename as string}</p>
                        <p className="text-gray-500 text-xs">
                          {new Date(doc.created_at as string).toLocaleDateString("es-CL")}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded capitalize ${
                        doc.status === "approved" ? "bg-green-900/30 text-green-400" :
                        doc.status === "uploaded" ? "bg-blue-900/30 text-blue-400" :
                        "bg-yellow-900/30 text-yellow-400"
                      }`}>
                        {doc.status as string}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Broker notes */}
      <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
        <h2 className="text-white font-semibold mb-4">Notas del broker</h2>
        <BrokerNotesEditor operationId={operation.id} initialNotes={operation.broker_notes} />
      </div>
    </div>
  );
}
