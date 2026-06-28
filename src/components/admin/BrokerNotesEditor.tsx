"use client";

import { useState, useRef } from "react";

interface BrokerNotesEditorProps {
  operationId: string;
  initialNotes?: string | null;
}

export default function BrokerNotesEditor({ operationId, initialNotes }: BrokerNotesEditorProps) {
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const save = async (value: string) => {
    setSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch(`/api/admin/operations/${operationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ broker_notes: value }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } else {
        const data = await res.json();
        setError(data.error || "Error al guardar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);

    // Debounce auto-save on blur or after 2s
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => save(val), 2000);
  };

  const handleBlur = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    save(notes);
  };

  return (
    <div>
      <textarea
        value={notes}
        onChange={handleChange}
        onBlur={handleBlur}
        rows={5}
        placeholder="Escribe notas internas sobre esta operación..."
        className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-lg px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder-gray-600 text-sm resize-none"
      />
      <div className="flex items-center justify-between mt-2">
        {error && <p className="text-red-400 text-xs">{error}</p>}
        {saving && <p className="text-gray-500 text-xs">Guardando...</p>}
        {saved && !saving && <p className="text-green-400 text-xs">Guardado</p>}
        {!saving && !saved && !error && (
          <p className="text-gray-600 text-xs">Se guarda automáticamente al salir del campo</p>
        )}
        <button
          type="button"
          onClick={() => save(notes)}
          disabled={saving}
          className="ml-auto px-4 py-1.5 bg-[#C9A84C] text-[#0A0A0A] text-xs font-semibold rounded-lg hover:bg-[#b8973b] transition-colors disabled:opacity-50"
        >
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
