import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import UserStatusSelect from "@/components/admin/UserStatusSelect";
import DeleteUserButton from "@/components/admin/DeleteUserButton";

async function getBuyer(id: string) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await admin
    .from("users")
    .select(`*, buyer_profiles(*)`)
    .eq("id", id)
    .eq("role", "buyer")
    .single();

  if (!data) return null;

  let kycIdUrl: string | null = null;
  let kycSelfieUrl: string | null = null;

  if (data.kyc_id_url) {
    const path = data.kyc_id_url.split("/kyc/")[1];
    if (path) {
      const { data: signed } = await admin.storage.from("kyc").createSignedUrl(path, 3600);
      kycIdUrl = signed?.signedUrl ?? null;
    }
  }
  if (data.kyc_selfie_url) {
    const path = data.kyc_selfie_url.split("/kyc/")[1];
    if (path) {
      const { data: signed } = await admin.storage.from("kyc").createSignedUrl(path, 3600);
      kycSelfieUrl = signed?.signedUrl ?? null;
    }
  }

  return { ...data, kycIdUrl, kycSelfieUrl };
}

function InfoRow({ label, value }: { label: string; value: string | number | null | undefined }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-[#2a2a2a] last:border-0">
      <span className="text-sm text-gray-500 font-mono">{label}</span>
      <span className="text-sm text-white text-right max-w-[60%]">{value ?? "—"}</span>
    </div>
  );
}

export default async function BuyerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const buyer = await getBuyer(id);
  if (!buyer) notFound();

  const profile = Array.isArray(buyer.buyer_profiles)
    ? buyer.buyer_profiles[0]
    : buyer.buyer_profiles;

  const STATUS_LABEL: Record<string, string> = {
    pending: "Pendiente de revisión",
    active: "Aprobado",
    rejected: "Rechazado",
  };

  const STATUS_CLS: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10",
    active: "text-emerald-400 bg-emerald-400/10",
    rejected: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/buyers" className="text-gray-500 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-white font-cormorant">{buyer.full_name}</h1>
          <p className="text-gray-500 text-sm">{buyer.email}</p>
        </div>
        <div className="ml-auto flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_CLS[buyer.status] ?? "text-gray-400 bg-gray-400/10"}`}>
            {STATUS_LABEL[buyer.status] ?? buyer.status}
          </span>
          <UserStatusSelect userId={buyer.id} currentStatus={buyer.status} />
          <DeleteUserButton userId={buyer.id} userName={buyer.full_name} redirectTo="/admin/buyers" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Datos personales */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-sm font-mono text-[#C9A84C] uppercase tracking-widest mb-4">Información Personal</h2>
          <InfoRow label="Nombre" value={buyer.full_name} />
          <InfoRow label="Email" value={buyer.email} />
          <InfoRow label="Teléfono" value={buyer.phone} />
          <InfoRow label="País" value={buyer.country} />
          <InfoRow label="Registro" value={new Date(buyer.created_at).toLocaleDateString("es-CL")} />
        </div>

        {/* Intereses de compra */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-6">
          <h2 className="text-sm font-mono text-[#C9A84C] uppercase tracking-widest mb-4">Intereses de Compra</h2>
          <InfoRow
            label="Metales de interés"
            value={Array.isArray(profile?.metals_interested) ? profile.metals_interested.join(", ") : profile?.metals_interested}
          />
          <InfoRow label="Pureza mínima" value={profile?.min_purity != null ? `${profile.min_purity}%` : null} />
          <InfoRow label="Cantidad necesaria" value={profile?.quantity_needed_kg != null ? `${profile.quantity_needed_kg.toLocaleString()} kg` : null} />
          <InfoRow label="País de destino" value={profile?.destination_country} />
          <InfoRow label="Método de pago" value={profile?.payment_method} />
          {profile?.notes && <InfoRow label="Notas" value={profile.notes} />}
        </div>

        {/* KYC */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-lg p-6 lg:col-span-2">
          <h2 className="text-sm font-mono text-[#C9A84C] uppercase tracking-widest mb-4">Verificación de Identidad (KYC)</h2>

          {!buyer.kycIdUrl && !buyer.kycSelfieUrl ? (
            <p className="text-gray-600 text-sm">Este usuario no ha subido documentos de identidad aún.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {buyer.kycIdUrl && (
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Documento de Identidad</p>
                  <a href={buyer.kycIdUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={buyer.kycIdUrl}
                      alt="Documento de identidad"
                      className="w-full rounded-lg border border-[#2a2a2a] object-cover max-h-64 hover:opacity-90 transition-opacity cursor-zoom-in"
                    />
                  </a>
                  <p className="text-xs text-gray-600 mt-1">Click para ver en tamaño completo</p>
                </div>
              )}
              {buyer.kycSelfieUrl && (
                <div>
                  <p className="text-xs font-mono text-gray-500 uppercase tracking-wider mb-2">Selfie con Documento</p>
                  <a href={buyer.kycSelfieUrl} target="_blank" rel="noopener noreferrer">
                    <img
                      src={buyer.kycSelfieUrl}
                      alt="Selfie con documento"
                      className="w-full rounded-lg border border-[#2a2a2a] object-cover max-h-64 hover:opacity-90 transition-opacity cursor-zoom-in"
                    />
                  </a>
                  <p className="text-xs text-gray-600 mt-1">Click para ver en tamaño completo</p>
                </div>
              )}
            </div>
          )}

          {buyer.status === "pending" && (
            <div className="flex gap-3 mt-6 pt-6 border-t border-[#2a2a2a]">
              <form action="/api/admin/users/approve" method="POST" className="flex-1">
                <input type="hidden" name="userId" value={buyer.id} />
                <input type="hidden" name="status" value="active" />
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-md transition-colors text-sm">
                  <CheckCircle size={16} />
                  Aprobar comprador
                </button>
              </form>
              <form action="/api/admin/users/approve" method="POST" className="flex-1">
                <input type="hidden" name="userId" value={buyer.id} />
                <input type="hidden" name="status" value="rejected" />
                <button type="submit"
                  className="w-full flex items-center justify-center gap-2 bg-red-900/50 hover:bg-red-900 border border-red-700 text-red-400 hover:text-white font-medium py-2.5 rounded-md transition-colors text-sm">
                  <XCircle size={16} />
                  Rechazar comprador
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
