"use client";

import { useState, useRef } from "react";
import { Upload, CheckCircle, FileText, X } from "lucide-react";

interface Props {
  documentId: string;
  documentName: string;
  alreadySigned: boolean;
  onSuccess?: () => void;
}

export default function UploadSignedDocument({ documentId, documentName, alreadySigned, onSuccess }: Props) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(alreadySigned);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("signed_document", file);

      const res = await fetch(`/api/portal/documents/${documentId}/sign`, {
        method: "POST",
        body: fd,
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error ?? "Error al subir el archivo");
        return;
      }

      setDone(true);
      setOpen(false);
      setFile(null);
      onSuccess?.();
      // Reload to update status badge
      window.location.reload();
    } catch {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  }

  if (done) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-900/20 border border-emerald-700/40 text-emerald-400 rounded-lg text-sm">
        <CheckCircle size={14} />
        Documento firmado enviado
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-[#3a3a3a] text-gray-300 hover:text-white hover:border-[#C9A84C]/50 rounded-lg text-sm font-medium transition-colors"
      >
        <Upload size={14} />
        Subir firmado
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => { setOpen(false); setFile(null); setError(null); }}
          />

          {/* Modal */}
          <div className="relative bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-white font-semibold text-lg">Subir documento firmado</h3>
                <p className="text-gray-500 text-sm mt-0.5">{documentName}</p>
              </div>
              <button
                onClick={() => { setOpen(false); setFile(null); setError(null); }}
                className="text-gray-600 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Instructions */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4 mb-4">
              <p className="text-xs text-gray-400 leading-relaxed">
                <span className="text-[#C9A84C] font-medium">Instrucciones:</span> Descarga el documento, imprímelo, fírmalo a mano, escanéalo o fotográfialo y sube el archivo aquí.
              </p>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => inputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                file
                  ? "border-[#C9A84C] bg-[#C9A84C]/5"
                  : "border-[#2a2a2a] hover:border-[#C9A84C]/50 bg-[#1a1a1a]"
              }`}
            >
              {file ? (
                <div className="flex flex-col items-center gap-2 text-[#C9A84C]">
                  <FileText size={28} />
                  <span className="text-sm font-medium">{file.name}</span>
                  <span className="text-xs opacity-60">{(file.size / 1024).toFixed(0)} KB</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <Upload size={28} />
                  <span className="text-sm">Haz click para seleccionar el archivo</span>
                  <span className="text-xs text-gray-600">PDF, JPG o PNG — máx. 10MB</span>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setError(null);
                }}
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm mt-3">{error}</p>
            )}

            <div className="flex gap-3 mt-5">
              <button
                onClick={() => { setOpen(false); setFile(null); setError(null); }}
                className="flex-1 border border-[#2a2a2a] text-gray-400 hover:text-white py-2.5 rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="flex-1 bg-[#C9A84C] text-black font-semibold py-2.5 rounded-lg text-sm hover:bg-[#b8973b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {uploading ? "Subiendo..." : "Enviar documento firmado"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
