"use client";

import { useState, useRef, DragEvent, ChangeEvent } from "react";

interface DocumentUploaderProps {
  docType: string;
  operationId?: string;
  onSuccess?: () => void;
}

const ACCEPTED_TYPES = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
const ACCEPTED_EXTENSIONS = ".pdf,.jpg,.jpeg,.png";
const MAX_SIZE_MB = 10;

export default function DocumentUploader({ docType, operationId, onSuccess }: DocumentUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (f: File): string | null => {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      return "Solo se aceptan archivos PDF, JPG y PNG.";
    }
    if (f.size > MAX_SIZE_MB * 1024 * 1024) {
      return `El archivo no puede superar ${MAX_SIZE_MB}MB.`;
    }
    return null;
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) {
      setError(err);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) handleFile(selected);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);
      if (operationId) formData.append("operation_id", operationId);

      setProgress(40);

      const res = await fetch("/api/portal/documents/upload", {
        method: "POST",
        body: formData,
      });

      setProgress(80);

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Error al subir el archivo");
        setProgress(0);
      } else {
        setProgress(100);
        setSuccess(true);
        onSuccess?.();
      }
    } catch {
      setError("Error de conexión. Por favor intente nuevamente.");
      setProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center gap-3 bg-green-900/20 border border-green-700/40 rounded-lg px-4 py-3">
        <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <p className="text-green-400 text-sm font-medium">Documento subido correctamente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      {!file && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-[#C9A84C] bg-[#C9A84C]/5"
              : "border-[#2a2a2a] hover:border-[#C9A84C]/50 bg-[#0A0A0A]/50"
          }`}
        >
          <svg className="w-8 h-8 text-gray-600 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <p className="text-gray-400 text-sm">
            Arrastra tu archivo aquí o{" "}
            <span className="text-[#C9A84C]">haz clic para seleccionar</span>
          </p>
          <p className="text-gray-600 text-xs mt-1">PDF, JPG, PNG — máximo {MAX_SIZE_MB}MB</p>
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_EXTENSIONS}
            onChange={handleInputChange}
            className="hidden"
          />
        </div>
      )}

      {/* File preview */}
      {file && (
        <div className="flex items-center gap-3 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3">
          <div className="w-8 h-8 rounded-lg bg-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-medium truncate">{file.name}</p>
            <p className="text-gray-500 text-xs">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={() => { setFile(null); setError(null); }}
            className="text-gray-600 hover:text-gray-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Progress bar */}
      {isUploading && progress > 0 && (
        <div className="h-1.5 bg-[#2a2a2a] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C9A84C] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-xs">{error}</p>
      )}

      {/* Submit */}
      {file && (
        <button
          type="button"
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full bg-[#C9A84C] text-[#0A0A0A] font-semibold py-2.5 rounded-lg hover:bg-[#b8973b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isUploading ? "Subiendo..." : "Subir documento"}
        </button>
      )}
    </div>
  );
}
