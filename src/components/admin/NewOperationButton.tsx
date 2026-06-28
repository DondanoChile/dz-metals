"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewOperationButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    seller_id: "",
    metal_type: "",
    quantity_kg: "",
    broker_notes: "",
  });
  const router = useRouter();

  const METAL_TYPES = ["oro", "cobre", "plata", "molibdeno", "sal", "otro"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_id: form.seller_id,
          metal_type: form.metal_type,
          quantity_kg: parseFloat(form.quantity_kg),
          broker_notes: form.broker_notes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al crear operación");
      } else {
        setOpen(false);
        setForm({ seller_id: "", metal_type: "", quantity_kg: "", broker_notes: "" });
        router.refresh();
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder-gray-600 text-sm";

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#C9A84C] text-[#0A0A0A] font-semibold rounded-lg hover:bg-[#b8973b] transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nueva Operación
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">Nueva Operación</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-600 hover:text-gray-300 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  ID del Vendedor *
                </label>
                <input
                  value={form.seller_id}
                  onChange={(e) => setForm({ ...form, seller_id: e.target.value })}
                  required
                  className={inputCls}
                  placeholder="UUID del vendedor"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Tipo de metal *
                </label>
                <select
                  value={form.metal_type}
                  onChange={(e) => setForm({ ...form, metal_type: e.target.value })}
                  required
                  className={inputCls}
                >
                  <option value="">Seleccionar...</option>
                  {METAL_TYPES.map((m) => (
                    <option key={m} value={m} className="capitalize">{m}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Cantidad (kg) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity_kg}
                  onChange={(e) => setForm({ ...form, quantity_kg: e.target.value })}
                  required
                  className={inputCls}
                  placeholder="5000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Notas del broker
                </label>
                <textarea
                  value={form.broker_notes}
                  onChange={(e) => setForm({ ...form, broker_notes: e.target.value })}
                  rows={3}
                  className={`${inputCls} resize-none`}
                  placeholder="Notas internas..."
                />
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <div className="flex gap-3 pt-2">
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
                  {loading ? "Creando..." : "Crear operación"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
