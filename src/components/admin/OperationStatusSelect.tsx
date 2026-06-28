"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface OperationStatusSelectProps {
  operationId: string;
  currentStatus: string;
}

const STATUS_OPTIONS = [
  { value: "new", label: "Nuevo" },
  { value: "contacted", label: "Contactado" },
  { value: "nda_sent", label: "NDA Enviado" },
  { value: "negotiating", label: "Negociando" },
  { value: "closed", label: "Cerrado" },
  { value: "cancelled", label: "Cancelado" },
];

export default function OperationStatusSelect({ operationId, currentStatus }: OperationStatusSelectProps) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/operations/${operationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setStatus(newStatus);
        router.refresh();
      }
    } catch {
      setStatus(status);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={status}
      onChange={handleChange}
      disabled={loading}
      className="bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 text-xs rounded-md px-2 py-1.5 focus:outline-none focus:border-[#C9A84C] disabled:opacity-50 cursor-pointer"
    >
      {STATUS_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
