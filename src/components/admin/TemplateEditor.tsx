"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Save, CheckCircle } from "lucide-react";

interface Template {
  id: string;
  code: string;
  name_es: string;
  name_en: string;
  content_es: string;
  content_en: string;
  fields: string[];
  has_exclusivity_clause: boolean;
  has_traceability_field: boolean;
}

const FIELD_LABELS: Record<string, string> = {
  fecha: "{{fecha}}",
  ciudad: "{{ciudad}}",
  metal: "{{metal}}",
  cantidad_kg: "{{cantidad_kg}}",
  precio_usd: "{{precio_usd}}",
  incoterms: "{{incoterms}}",
  forma_pago: "{{forma_pago}}",
  plazo_entrega: "{{plazo_entrega}}",
  lugar_entrega: "{{lugar_entrega}}",
  duracion_meses: "{{duracion_meses}}",
  territorio: "{{territorio}}",
  comision_pct: "{{comision_pct}}",
  plazo_meses: "{{plazo_meses}}",
  pureza: "{{pureza}}",
};

const CLIENT_VARS_NATURAL = [
  "{{nombre_cliente}}",
  "{{rut_pasaporte}}",
  "{{nacionalidad}}",
  "{{pais_cliente}}",
];

const CLIENT_VARS_EMPRESA = [
  "{{razon_social}}",
  "{{rut_empresa}}",
  "{{representante_legal}}",
  "{{rut_representante}}",
  "{{pais_cliente}}",
];

function TemplateCard({ template }: { template: Template }) {
  const [open, setOpen] = useState(false);
  const [contentEs, setContentEs] = useState(template.content_es);
  const [contentEn, setContentEn] = useState(template.content_en);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"es" | "en">("es");

  const hasContent = contentEs.trim().length > 0;

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/templates/${template.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content_es: contentEs, content_en: contentEn }),
      });
      if (!res.ok) {
        const d = await res.json();
        setError(d.error ?? "Error al guardar");
        return;
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  }

  const templateFields = Array.isArray(template.fields) ? template.fields : [];

  return (
    <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#1a1a1a] transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${hasContent ? "bg-emerald-400" : "bg-yellow-400"}`} />
          <div>
            <p className="text-white font-medium">{template.name_es}</p>
            <p className="text-gray-500 text-xs">{template.name_en}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded-full ${hasContent ? "bg-emerald-900/30 text-emerald-400" : "bg-yellow-900/30 text-yellow-400"}`}>
            {hasContent ? "Con contenido" : "Sin contenido"}
          </span>
          {open ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-[#2a2a2a] p-6 space-y-5">
          {/* Variables reference */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-4">
            <p className="text-xs text-[#C9A84C] font-mono uppercase tracking-wider mb-3">Variables disponibles</p>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500 mb-1">Cliente (persona natural):</p>
                <div className="flex flex-wrap gap-1.5">
                  {CLIENT_VARS_NATURAL.map(v => (
                    <code key={v} className="text-xs bg-[#2a2a2a] text-[#C9A84C] px-2 py-0.5 rounded font-mono">{v}</code>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Cliente (empresa):</p>
                <div className="flex flex-wrap gap-1.5">
                  {CLIENT_VARS_EMPRESA.map(v => (
                    <code key={v} className="text-xs bg-[#2a2a2a] text-[#C9A84C] px-2 py-0.5 rounded font-mono">{v}</code>
                  ))}
                </div>
              </div>
              {templateFields.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Campos específicos de este documento:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {templateFields.map(f => (
                      <code key={f} className="text-xs bg-[#2a2a2a] text-blue-400 px-2 py-0.5 rounded font-mono">
                        {FIELD_LABELS[f] ?? `{{${f}}}`}
                      </code>
                    ))}
                  </div>
                </div>
              )}
              {template.has_exclusivity_clause && (
                <p className="text-xs text-gray-500">• La cláusula de exclusividad se agrega automáticamente si el admin la activa al enviar.</p>
              )}
              {template.has_traceability_field && (
                <p className="text-xs text-gray-500">• La cláusula de trazabilidad se agrega automáticamente según el checkbox al enviar.</p>
              )}
            </div>
          </div>

          {/* Language tabs */}
          <div className="flex gap-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-1 w-fit">
            <button
              onClick={() => setTab("es")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "es" ? "bg-[#C9A84C] text-black" : "text-gray-400 hover:text-white"}`}
            >
              Español
            </button>
            <button
              onClick={() => setTab("en")}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === "en" ? "bg-[#C9A84C] text-black" : "text-gray-400 hover:text-white"}`}
            >
              English
            </button>
          </div>

          {/* Text editor */}
          {tab === "es" ? (
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
                Contenido en Español
              </label>
              <textarea
                value={contentEs}
                onChange={(e) => setContentEs(e.target.value)}
                rows={20}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors font-mono text-sm resize-y"
                placeholder={`Pega aquí el texto del documento en español.\n\nUsa las variables como {{nombre_cliente}}, {{fecha}}, {{metal}}, etc.\n\nEjemplo:\nEn la ciudad de {{ciudad}}, con fecha {{fecha}}, comparecen:\n\nPOR UNA PARTE: {{nombre_cliente}}, identificado con RUT/Pasaporte N° {{rut_pasaporte}}...\n\nPOR OTRA PARTE: DZ METALS...`}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs text-gray-400 uppercase tracking-wide mb-2">
                Content in English
              </label>
              <textarea
                value={contentEn}
                onChange={(e) => setContentEn(e.target.value)}
                rows={20}
                className="w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors font-mono text-sm resize-y"
                placeholder={`Paste the English version of the document here.\n\nUse variables like {{nombre_cliente}}, {{fecha}}, {{metal}}, etc.\n\nExample:\nIn the city of {{ciudad}}, on {{fecha}}, the following parties appear:\n\nON ONE HAND: {{nombre_cliente}}, identified with RUT/Passport No. {{rut_pasaporte}}...\n\nON THE OTHER HAND: DZ METALS...`}
              />
            </div>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C9A84C] text-black font-medium rounded-lg hover:bg-[#b8973b] transition-colors disabled:opacity-50 text-sm"
            >
              {saved ? (
                <><CheckCircle size={15} /> Guardado</>
              ) : saving ? (
                "Guardando..."
              ) : (
                <><Save size={15} /> Guardar plantilla</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TemplateEditor({ templates }: { templates: Template[] }) {
  return (
    <div className="max-w-4xl space-y-3">
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 text-sm text-gray-400 mb-6">
        <span className="text-[#C9A84C] font-medium">Instrucciones:</span> Haz click en cada documento para editar su contenido. Pega el texto de tus plantillas Word y reemplaza los datos variables con las etiquetas{" "}
        <code className="text-[#C9A84C] bg-[#2a2a2a] px-1 rounded">{"{{variable}}"}</code>.
        El punto verde indica que ya tiene contenido cargado.
      </div>
      {templates.map((t) => (
        <TemplateCard key={t.id} template={t} />
      ))}
    </div>
  );
}
