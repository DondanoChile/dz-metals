"use client";

import { useState } from "react";

interface UserProfile {
  // Seller
  metal_type?: string;
  metal_state?: string;
  purity?: number;
  humidity?: number;
  quantity_kg?: number;
  origin_country?: string;
  origin_region?: string;
  has_analysis?: boolean;
  analysis_lab?: string;
  // Buyer
  metals_interested?: string[];
  quantity_needed_kg?: number;
  destination_country?: string;
  payment_method?: string;
}

interface UserCardProps {
  user: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    country?: string;
    role: "buyer" | "seller";
    status: string;
    created_at: string;
  };
  profile?: UserProfile | null;
  onStatusChange?: (newStatus: string) => void;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendiente" },
  { value: "approved", label: "Aprobar" },
  { value: "rejected", label: "Rechazar" },
  { value: "active", label: "Activo" },
];

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: "bg-yellow-900/30 text-yellow-400 border border-yellow-700/40",
    approved: "bg-green-900/30 text-green-400 border border-green-700/40",
    rejected: "bg-red-900/30 text-red-400 border border-red-700/40",
    active: "bg-blue-900/30 text-blue-400 border border-blue-700/40",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${config[status] ?? "bg-gray-800 text-gray-400"}`}>
      {status}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value?: string | number | null | boolean }) {
  if (value === undefined || value === null || value === "") return null;
  return (
    <div className="flex justify-between py-2 border-b border-[#2a2a2a] last:border-0">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="text-white text-sm text-right">{typeof value === "boolean" ? (value ? "Sí" : "No") : String(value)}</span>
    </div>
  );
}

export default function UserCard({ user, profile, onStatusChange }: UserCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(user.status);
  const [error, setError] = useState<string | null>(null);

  const updateStatus = async (newStatus: string) => {
    if (newStatus === currentStatus) return;
    setIsUpdating(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/users/${user.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setCurrentStatus(newStatus);
        onStatusChange?.(newStatus);
      } else {
        const data = await res.json();
        setError(data.error || "Error al actualizar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#2a2a2a] flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-full bg-[#C9A84C]/20 flex items-center justify-center">
              <span className="text-[#C9A84C] font-bold">
                {user.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="text-white font-semibold">{user.full_name}</h3>
              <p className="text-gray-500 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2 ml-13">
            <StatusBadge status={currentStatus} />
            <span className="text-gray-600 text-xs capitalize">{user.role}</span>
          </div>
        </div>
        <p className="text-gray-600 text-xs">
          {new Date(user.created_at).toLocaleDateString("es-CL")}
        </p>
      </div>

      {/* Personal info */}
      <div className="px-6 py-4">
        <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">Información personal</p>
        <InfoRow label="Teléfono" value={user.phone} />
        <InfoRow label="País" value={user.country} />
      </div>

      {/* Role-specific data */}
      {profile && (
        <div className="px-6 py-4 border-t border-[#2a2a2a]">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
            {user.role === "seller" ? "Detalles del material" : "Preferencias de compra"}
          </p>
          {user.role === "seller" ? (
            <>
              <InfoRow label="Metal" value={profile.metal_type} />
              <InfoRow label="Estado" value={profile.metal_state} />
              <InfoRow label="Pureza" value={profile.purity != null ? `${profile.purity}%` : null} />
              <InfoRow label="Humedad" value={profile.humidity != null ? `${profile.humidity}%` : null} />
              <InfoRow label="Cantidad" value={profile.quantity_kg ? `${profile.quantity_kg.toLocaleString()} kg` : null} />
              <InfoRow label="Origen" value={profile.origin_region && profile.origin_country ? `${profile.origin_region}, ${profile.origin_country}` : null} />
              <InfoRow label="Tiene análisis" value={profile.has_analysis} />
              {profile.has_analysis && <InfoRow label="Laboratorio" value={profile.analysis_lab} />}
            </>
          ) : (
            <>
              <InfoRow label="Metales interés" value={profile.metals_interested?.join(", ")} />
              <InfoRow label="Cantidad requerida" value={profile.quantity_needed_kg ? `${profile.quantity_needed_kg.toLocaleString()} kg` : null} />
              <InfoRow label="Destino" value={profile.destination_country} />
              <InfoRow label="Método de pago" value={profile.payment_method} />
            </>
          )}
        </div>
      )}

      {/* Status actions */}
      <div className="px-6 py-4 border-t border-[#2a2a2a] bg-[#0e0e0e]">
        {error && <p className="text-red-400 text-xs mb-3">{error}</p>}
        <div className="flex gap-2 flex-wrap">
          {currentStatus !== "approved" && (
            <button
              onClick={() => updateStatus("approved")}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-green-900/30 border border-green-700/50 text-green-400 rounded-lg text-sm font-medium hover:bg-green-900/50 transition-colors disabled:opacity-50"
            >
              {isUpdating ? "..." : "Aprobar"}
            </button>
          )}
          {currentStatus !== "rejected" && (
            <button
              onClick={() => updateStatus("rejected")}
              disabled={isUpdating}
              className="flex-1 px-4 py-2 bg-red-900/30 border border-red-700/50 text-red-400 rounded-lg text-sm font-medium hover:bg-red-900/50 transition-colors disabled:opacity-50"
            >
              {isUpdating ? "..." : "Rechazar"}
            </button>
          )}
          {currentStatus !== "pending" && (
            <button
              onClick={() => updateStatus("pending")}
              disabled={isUpdating}
              className="px-4 py-2 bg-[#2a2a2a] text-gray-400 rounded-lg text-sm font-medium hover:bg-[#3a3a3a] transition-colors disabled:opacity-50"
            >
              {isUpdating ? "..." : "Pendiente"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
