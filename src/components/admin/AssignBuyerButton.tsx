"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface AssignBuyerButtonProps {
  operationId: string;
}

export default function AssignBuyerButton({ operationId }: AssignBuyerButtonProps) {
  const [open, setOpen] = useState(false);
  const [buyerId, setBuyerId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerId.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/admin/operations/${operationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ buyer_id: buyerId.trim() }),
      });

      if (res.ok) {
        setOpen(false);
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Error al asignar comprador");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-[#C9A84C] border border-[#C9A84C]/30 px-3 py-1 rounded-lg hover:bg-[#C9A84C]/10 transition-colors"
      >
        Asignar comprador
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-sm z-10">
            <h3 className="text-white font-semibold mb-4">Asignar Comprador</h3>

            <form onSubmit={handleAssign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ID del comprador
                </label>
                <input
                  value={buyerId}
                  onChange={(e) => setBuyerId(e.target.value)}
                  required
                  className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] text-sm placeholder-gray-600"
                  placeholder="UUID del comprador"
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 border border-[#2a2a2a] text-gray-300 py-2.5 rounded-lg text-sm hover:border-gray-500 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#C9A84C] text-[#0A0A0A] font-semibold py-2.5 rounded-lg text-sm hover:bg-[#b8973b] transition-colors disabled:opacity-50"
                >
                  {loading ? "Asignando..." : "Asignar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
