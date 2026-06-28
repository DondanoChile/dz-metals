import React from "react";

type OperationStatus =
  | "new"
  | "contacted"
  | "nda_sent"
  | "negotiating"
  | "closed"
  | "cancelled";

interface OperationStatusBadgeProps {
  status: string;
}

const STATUS_CONFIG: Record<
  OperationStatus,
  { label: string; className: string }
> = {
  new: {
    label: "Nuevo",
    className: "bg-gray-800 text-gray-300 border border-gray-700",
  },
  contacted: {
    label: "Contactado",
    className: "bg-blue-900/30 text-blue-400 border border-blue-700/50",
  },
  nda_sent: {
    label: "NDA Enviado",
    className: "bg-yellow-900/30 text-yellow-400 border border-yellow-700/50",
  },
  negotiating: {
    label: "Negociando",
    className: "bg-orange-900/30 text-orange-400 border border-orange-700/50",
  },
  closed: {
    label: "Cerrado",
    className: "bg-green-900/30 text-green-400 border border-green-700/50",
  },
  cancelled: {
    label: "Cancelado",
    className: "bg-red-900/30 text-red-400 border border-red-700/50",
  },
};

export default function OperationStatusBadge({ status }: OperationStatusBadgeProps) {
  const config =
    STATUS_CONFIG[status as OperationStatus] ?? {
      label: status,
      className: "bg-gray-800 text-gray-400 border border-gray-700",
    };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}
