"use client";

import { useState } from "react";

interface RequestDocumentButtonProps {
  operationId: string;
  sellerId: string;
  buyerId?: string;
}

const DOC_TYPES = ["NDA", "LOI", "SCO", "Certificado de Análisis", "Documento de Identidad", "Passport", "Factura Comercial", "Otro"];

export default function RequestDocumentButton({ operationId, sellerId, buyerId }: RequestDocumentButtonProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    user_id: sellerId,
    doc_type: "",
    message: "",
  });

  const inputCls =
    "w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder-gray-600 text-sm";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/documents/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: form.user_id,
          operation_id: operationId,
          doc_type: form.doc_type,
          message: form.message,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al enviar solicitud");
      } else {
        setSuccess(true);
        setTimeout(() => {
          setOpen(false);
          setSuccess(false);
          setForm({ user_id: sellerId, doc_type: "", message: "" });
        }, 1500);
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
        className="flex items-center gap-2 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] text-gray-300 rounded-lg hover:border-[#C9A84C] hover:text-white transition-colors text-sm"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Solicitar documento
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md z-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-semibold text-lg">Solicitar Documento</h2>
              <button onClick={() => setOpen(false)} className="text-gray-600 hover:text-gray-300">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {success ? (
              <div className="flex items-center gap-3 bg-green-900/20 border border-green-700/40 rounded-lg px-4 py-3">
                <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <p className="text-green-400 text-sm">Solicitud enviada correctamente</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Enviar a</label>
                  <select
                    value={form.user_id}
                    onChange={(e) => setForm({ ...form, user_id: e.target.value })}
                    className={inputCls}
                  >
                    <option value={sellerId}>Vendedor</option>
                    {buyerId && <option value={buyerId}>Comprador</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tipo de documento *</label>
                  <select
                    value={form.doc_type}
                    onChange={(e) => setForm({ ...form, doc_type: e.target.value })}
                    required
                    className={inputCls}
                  >
                    <option value="">Seleccionar...</option>
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Mensaje *</label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    required
                    rows={3}
                    className={`${inputCls} resize-none`}
                    placeholder="Explica al usuario qué necesitas y por qué..."
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
                    {loading ? "Enviando..." : "Enviar solicitud"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
