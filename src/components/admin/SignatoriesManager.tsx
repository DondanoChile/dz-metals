"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle } from "lucide-react";

interface Signatory {
  id: string;
  full_name: string;
  position: string;
  rut?: string;
  signature_url?: string;
  is_active: boolean;
  created_at: string;
}

interface Props {
  initialSignatories: Signatory[];
}

const inputClass =
  "w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder-gray-600 text-sm";

const labelClass = "block text-xs text-gray-400 mb-1.5 uppercase tracking-wide";

export default function SignatoriesManager({ initialSignatories }: Props) {
  const [signatories, setSignatories] = useState<Signatory[]>(initialSignatories);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ full_name: "", position: "", rut: "" });
  const [signatureFile, setSignatureFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploadingSignatureFor, setUploadingSignatureFor] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadRefs = useRef<Record<string, HTMLInputElement | null>>({});

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.full_name || !formData.position) {
      setError("Nombre y cargo son obligatorios.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/signatories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al guardar.");
        return;
      }

      let newSignatory: Signatory = data;

      // Upload signature if provided
      if (signatureFile) {
        const url = await uploadSignature(data.id, signatureFile);
        if (url) newSignatory = { ...newSignatory, signature_url: url };
      }

      setSignatories((prev) => [newSignatory, ...prev]);
      setFormData({ full_name: "", position: "", rut: "" });
      setSignatureFile(null);
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function uploadSignature(signatoryId: string, file: File): Promise<string | null> {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("signatoryId", signatoryId);
    const res = await fetch("/api/admin/signatories/signature", { method: "POST", body: fd });
    if (!res.ok) return null;
    const data = await res.json();
    return data.signature_url ?? null;
  }

  async function handleSignatureUpload(signatory: Signatory, file: File) {
    setUploadingSignatureFor(signatory.id);
    try {
      const url = await uploadSignature(signatory.id, file);
      if (url) {
        setSignatories((prev) =>
          prev.map((s) => (s.id === signatory.id ? { ...s, signature_url: url } : s))
        );
      }
    } finally {
      setUploadingSignatureFor(null);
    }
  }

  async function toggleActive(signatory: Signatory) {
    setTogglingId(signatory.id);
    try {
      const res = await fetch(`/api/admin/signatories/${signatory.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !signatory.is_active }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSignatories((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      }
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar este firmante? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/signatories/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSignatories((prev) => prev.filter((s) => s.id !== id));
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-black font-medium rounded-lg hover:bg-[#b8973b] transition-colors text-sm"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          {showForm ? "Cancelar" : "Agregar firmante"}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-5">Nuevo firmante</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre completo</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                  className={inputClass}
                  placeholder="Carlos Martínez"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Cargo</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData((p) => ({ ...p, position: e.target.value }))}
                  className={inputClass}
                  placeholder="Director Comercial"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>RUT (opcional)</label>
                <input
                  type="text"
                  value={formData.rut}
                  onChange={(e) => setFormData((p) => ({ ...p, rut: e.target.value }))}
                  className={inputClass}
                  placeholder="12.345.678-9"
                />
              </div>
              <div>
                <label className={labelClass}>Firma (PNG opcional)</label>
                <div
                  onClick={() => fileRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-md px-4 py-3 cursor-pointer transition-colors text-center ${
                    signatureFile
                      ? "border-[#C9A84C] bg-[#C9A84C]/5"
                      : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#C9A84C]/50"
                  }`}
                >
                  {signatureFile ? (
                    <div className="flex items-center justify-center gap-2 text-[#C9A84C]">
                      <CheckCircle size={14} />
                      <span className="text-xs truncate max-w-[150px]">{signatureFile.name}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <Upload size={14} />
                      <span className="text-xs">Subir imagen de firma</span>
                    </div>
                  )}
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(e) => setSignatureFile(e.target.files?.[0] ?? null)}
                  />
                </div>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 bg-[#C9A84C] text-black font-medium rounded-lg hover:bg-[#b8973b] transition-colors disabled:opacity-50 text-sm"
              >
                {saving ? "Guardando..." : "Guardar firmante"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List */}
      {signatories.length === 0 ? (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <p className="text-gray-400">No hay firmantes configurados.</p>
          <p className="text-gray-600 text-sm mt-1">Agrega el primer firmante usando el botón de arriba.</p>
        </div>
      ) : (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-left">
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Cargo</th>
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">RUT</th>
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Firma</th>
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {signatories.map((s) => (
                <tr key={s.id} className={`hover:bg-[#1a1a1a] transition-colors ${!s.is_active ? "opacity-50" : ""}`}>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{s.full_name}</p>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{s.position}</td>
                  <td className="px-6 py-4 text-gray-500 font-mono text-xs">{s.rut ?? "—"}</td>
                  <td className="px-6 py-4">
                    {s.signature_url ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={s.signature_url}
                          alt="Firma"
                          className="h-8 max-w-[100px] object-contain bg-white rounded px-1"
                        />
                        <button
                          onClick={() => uploadRefs.current[s.id]?.click()}
                          className="text-xs text-gray-500 hover:text-[#C9A84C] transition-colors"
                        >
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => uploadRefs.current[s.id]?.click()}
                        disabled={uploadingSignatureFor === s.id}
                        className="inline-flex items-center gap-1.5 text-xs text-[#C9A84C] hover:text-[#b8973b] transition-colors disabled:opacity-50"
                      >
                        <Upload size={12} />
                        {uploadingSignatureFor === s.id ? "Subiendo..." : "Subir firma"}
                      </button>
                    )}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      className="hidden"
                      ref={(el) => { uploadRefs.current[s.id] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleSignatureUpload(s, file);
                      }}
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      s.is_active
                        ? "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40"
                        : "bg-gray-800 text-gray-500 border border-gray-700/40"
                    }`}>
                      {s.is_active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleActive(s)}
                        disabled={togglingId === s.id}
                        className="text-xs text-gray-400 hover:text-white transition-colors disabled:opacity-50"
                      >
                        {togglingId === s.id ? "..." : s.is_active ? "Desactivar" : "Activar"}
                      </button>
                      <span className="text-gray-700">|</span>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={deletingId === s.id}
                        className="text-xs text-red-500 hover:text-red-400 transition-colors disabled:opacity-50"
                      >
                        {deletingId === s.id ? "..." : "Eliminar"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
