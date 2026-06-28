"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Template {
  id: string;
  code: string;
  name_es: string;
  name_en: string;
  fields: string[] | string;
  has_exclusivity_clause: boolean;
  has_traceability_field: boolean;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  role: string;
}

interface Signatory {
  id: string;
  full_name: string;
  position: string;
  rut?: string;
}

interface Props {
  templates: Template[];
  users: User[];
  signatories: Signatory[];
}

const FIELD_LABELS: Record<string, string> = {
  fecha: "Fecha",
  ciudad: "Ciudad",
  metal: "Tipo de metal",
  cantidad_kg: "Cantidad (kg)",
  precio_usd: "Precio (USD/kg)",
  incoterms: "Incoterms",
  forma_pago: "Forma de pago",
  plazo_entrega: "Plazo de entrega",
  lugar_entrega: "Lugar de entrega",
  duracion_meses: "Duración (meses)",
  territorio: "Territorio",
  comision_pct: "Comisión (%)",
  plazo_meses: "Plazo del mandato (meses)",
  pureza: "Pureza (%)",
  analysis_lab: "Laboratorio de análisis",
};

const inputClass =
  "w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder-gray-600";

const labelClass = "block text-sm text-gray-400 mb-1.5";

export default function SendDocumentForm({ templates, users, signatories }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Step 1 — recipient
  const [selectedUserId, setSelectedUserId] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Step 2 — template
  const [selectedTemplateCode, setSelectedTemplateCode] = useState("");

  // Step 3 — fields
  const [clientType, setClientType] = useState<"natural" | "empresa">("natural");
  const [language, setLanguage] = useState<"es" | "en" | "both">("es");
  const [signatoryId, setSignatoryId] = useState(signatories[0]?.id ?? "");
  const [includeExclusivity, setIncludeExclusivity] = useState(false);
  const [hasTraceability, setHasTraceability] = useState(false);
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});

  const selectedUser = users.find((u) => u.id === selectedUserId);
  const selectedTemplate = templates.find((t) => t.code === selectedTemplateCode);
  const templateFields: string[] = selectedTemplate
    ? Array.isArray(selectedTemplate.fields)
      ? selectedTemplate.fields
      : JSON.parse(selectedTemplate.fields as string ?? "[]")
    : [];

  const filteredUsers = users.filter(
    (u) =>
      u.full_name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  function setField(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSend() {
    if (!selectedUserId || !selectedTemplateCode || !signatoryId) {
      setError("Completa todos los campos obligatorios.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/documents/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateCode: selectedTemplateCode,
          userId: selectedUserId,
          signatoryId,
          language,
          clientType,
          fieldValues,
          includeExclusivity,
          hasTraceability,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Error al enviar el documento.");
        setLoading(false);
        return;
      }

      router.push("/admin/documents");
      router.refresh();
    } catch {
      setError("Error de red. Intenta nuevamente.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <button
              onClick={() => s < step && setStep(s)}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === s
                  ? "bg-[#C9A84C] text-black"
                  : step > s
                  ? "bg-[#C9A84C]/30 text-[#C9A84C] cursor-pointer"
                  : "bg-[#2a2a2a] text-gray-500"
              }`}
            >
              {s}
            </button>
            {s < 3 && (
              <div
                className={`h-px w-16 ${
                  step > s ? "bg-[#C9A84C]/50" : "bg-[#2a2a2a]"
                }`}
              />
            )}
          </div>
        ))}
        <div className="ml-4 flex gap-6">
          {["Destinatario", "Plantilla", "Campos"].map((label, i) => (
            <span
              key={label}
              className={`text-sm ${
                step === i + 1 ? "text-white font-medium" : "text-gray-500"
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Step 1: Select recipient */}
      {step === 1 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Seleccionar destinatario</h2>
          <div className="mb-4">
            <label className={labelClass}>Buscar usuario</label>
            <input
              type="text"
              placeholder="Nombre o email..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {filteredUsers.length === 0 && (
              <p className="text-gray-500 text-sm py-4 text-center">
                No se encontraron usuarios.
              </p>
            )}
            {filteredUsers.map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors text-left ${
                  selectedUserId === u.id
                    ? "border-[#C9A84C] bg-[#C9A84C]/10"
                    : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]"
                }`}
              >
                <div>
                  <p className="text-white text-sm font-medium">{u.full_name}</p>
                  <p className="text-gray-500 text-xs">{u.email}</p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    u.role === "buyer"
                      ? "bg-blue-900/40 text-blue-400"
                      : "bg-emerald-900/40 text-emerald-400"
                  }`}
                >
                  {u.role === "buyer" ? "Comprador" : "Vendedor"}
                </span>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <button
              disabled={!selectedUserId}
              onClick={() => setStep(2)}
              className="px-6 py-2.5 bg-[#C9A84C] text-black font-medium rounded-lg hover:bg-[#b8973b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Select template */}
      {step === 2 && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6">
          <h2 className="text-white font-semibold mb-4">Seleccionar plantilla</h2>
          <div className="grid grid-cols-1 gap-3">
            {templates.map((t) => (
              <button
                key={t.code}
                onClick={() => setSelectedTemplateCode(t.code)}
                className={`flex flex-col text-left px-5 py-4 rounded-lg border transition-colors ${
                  selectedTemplateCode === t.code
                    ? "border-[#C9A84C] bg-[#C9A84C]/10"
                    : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#3a3a3a]"
                }`}
              >
                <span className="text-white font-medium text-sm">{t.name_es}</span>
                <span className="text-gray-500 text-xs mt-0.5">{t.name_en}</span>
                <div className="flex gap-2 mt-2">
                  {t.has_exclusivity_clause && (
                    <span className="text-xs bg-amber-900/30 text-amber-400 px-2 py-0.5 rounded-full">
                      Cláusula exclusividad
                    </span>
                  )}
                  {t.has_traceability_field && (
                    <span className="text-xs bg-purple-900/30 text-purple-400 px-2 py-0.5 rounded-full">
                      Trazabilidad
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 border border-[#2a2a2a] text-gray-400 rounded-lg hover:text-white hover:border-[#3a3a3a] transition-colors"
            >
              Atrás
            </button>
            <button
              disabled={!selectedTemplateCode}
              onClick={() => setStep(3)}
              className="px-6 py-2.5 bg-[#C9A84C] text-black font-medium rounded-lg hover:bg-[#b8973b] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Fill fields */}
      {step === 3 && selectedTemplate && (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 space-y-6">
          <h2 className="text-white font-semibold">Completar campos del documento</h2>

          {/* Summary */}
          <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg px-4 py-3 flex items-center justify-between text-sm">
            <div>
              <span className="text-gray-400">Destinatario: </span>
              <span className="text-white">{selectedUser?.full_name}</span>
            </div>
            <div>
              <span className="text-gray-400">Plantilla: </span>
              <span className="text-white">{selectedTemplate.name_es}</span>
            </div>
          </div>

          {/* Client type toggle */}
          <div>
            <label className={labelClass}>Tipo de cliente</label>
            <div className="flex rounded-lg overflow-hidden border border-[#2a2a2a]">
              <button
                onClick={() => setClientType("natural")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  clientType === "natural"
                    ? "bg-[#C9A84C] text-black"
                    : "bg-[#1a1a1a] text-gray-400 hover:text-white"
                }`}
              >
                Persona Natural
              </button>
              <button
                onClick={() => setClientType("empresa")}
                className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
                  clientType === "empresa"
                    ? "bg-[#C9A84C] text-black"
                    : "bg-[#1a1a1a] text-gray-400 hover:text-white"
                }`}
              >
                Empresa
              </button>
            </div>
          </div>

          {/* Client identity fields */}
          {clientType === "natural" ? (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Nombre completo del cliente</label>
                <input
                  type="text"
                  value={fieldValues.nombre_cliente ?? ""}
                  onChange={(e) => setField("nombre_cliente", e.target.value)}
                  className={inputClass}
                  placeholder="Juan Pérez"
                />
              </div>
              <div>
                <label className={labelClass}>RUT / Pasaporte</label>
                <input
                  type="text"
                  value={fieldValues.rut_pasaporte ?? ""}
                  onChange={(e) => setField("rut_pasaporte", e.target.value)}
                  className={inputClass}
                  placeholder="12.345.678-9"
                />
              </div>
              <div>
                <label className={labelClass}>Nacionalidad</label>
                <input
                  type="text"
                  value={fieldValues.nacionalidad ?? ""}
                  onChange={(e) => setField("nacionalidad", e.target.value)}
                  className={inputClass}
                  placeholder="Chilena"
                />
              </div>
              <div>
                <label className={labelClass}>País</label>
                <input
                  type="text"
                  value={fieldValues.pais_cliente ?? ""}
                  onChange={(e) => setField("pais_cliente", e.target.value)}
                  className={inputClass}
                  placeholder="Chile"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Razón social</label>
                <input
                  type="text"
                  value={fieldValues.razon_social ?? ""}
                  onChange={(e) => setField("razon_social", e.target.value)}
                  className={inputClass}
                  placeholder="Empresa S.A."
                />
              </div>
              <div>
                <label className={labelClass}>RUT empresa</label>
                <input
                  type="text"
                  value={fieldValues.rut_empresa ?? ""}
                  onChange={(e) => setField("rut_empresa", e.target.value)}
                  className={inputClass}
                  placeholder="76.543.210-K"
                />
              </div>
              <div>
                <label className={labelClass}>Representante legal</label>
                <input
                  type="text"
                  value={fieldValues.representante_legal ?? ""}
                  onChange={(e) => setField("representante_legal", e.target.value)}
                  className={inputClass}
                  placeholder="María González"
                />
              </div>
              <div>
                <label className={labelClass}>RUT representante</label>
                <input
                  type="text"
                  value={fieldValues.rut_representante ?? ""}
                  onChange={(e) => setField("rut_representante", e.target.value)}
                  className={inputClass}
                  placeholder="14.567.890-1"
                />
              </div>
              <div>
                <label className={labelClass}>País</label>
                <input
                  type="text"
                  value={fieldValues.pais_cliente ?? ""}
                  onChange={(e) => setField("pais_cliente", e.target.value)}
                  className={inputClass}
                  placeholder="Chile"
                />
              </div>
            </div>
          )}

          {/* Template-specific fields */}
          {templateFields.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-300 mb-3">
                Datos del documento
              </p>
              <div className="grid grid-cols-2 gap-4">
                {templateFields.map((field) => (
                  <div key={field}>
                    <label className={labelClass}>
                      {FIELD_LABELS[field] ?? field}
                    </label>
                    <input
                      type={
                        field === "fecha"
                          ? "date"
                          : ["cantidad_kg", "precio_usd", "duracion_meses", "comision_pct", "plazo_meses", "pureza"].includes(field)
                          ? "number"
                          : "text"
                      }
                      value={fieldValues[field] ?? ""}
                      onChange={(e) => setField(field, e.target.value)}
                      className={inputClass}
                      placeholder={FIELD_LABELS[field] ?? field}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optional clauses */}
          {(selectedTemplate.has_exclusivity_clause || selectedTemplate.has_traceability_field) && (
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-300">Cláusulas opcionales</p>
              {selectedTemplate.has_exclusivity_clause && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setIncludeExclusivity(!includeExclusivity)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      includeExclusivity
                        ? "bg-[#C9A84C] border-[#C9A84C]"
                        : "border-[#3a3a3a] bg-[#1a1a1a] group-hover:border-[#C9A84C]/50"
                    }`}
                  >
                    {includeExclusivity && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-300 text-sm">
                    Incluir cláusula de exclusividad
                  </span>
                </label>
              )}
              {selectedTemplate.has_traceability_field && (
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    onClick={() => setHasTraceability(!hasTraceability)}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      hasTraceability
                        ? "bg-[#C9A84C] border-[#C9A84C]"
                        : "border-[#3a3a3a] bg-[#1a1a1a] group-hover:border-[#C9A84C]/50"
                    }`}
                  >
                    {hasTraceability && (
                      <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-gray-300 text-sm">
                    El vendedor tiene trazabilidad completa
                  </span>
                </label>
              )}
            </div>
          )}

          {/* Language selector */}
          <div>
            <label className={labelClass}>Idioma del documento</label>
            <div className="flex gap-3">
              {[
                { value: "es", label: "Español" },
                { value: "en", label: "English" },
                { value: "both", label: "Ambos" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLanguage(opt.value as "es" | "en" | "both")}
                  className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                    language === opt.value
                      ? "bg-[#C9A84C]/20 border-[#C9A84C] text-[#C9A84C]"
                      : "border-[#2a2a2a] bg-[#1a1a1a] text-gray-400 hover:border-[#3a3a3a] hover:text-white"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Signatory selector */}
          <div>
            <label className={labelClass}>Firmante de DZ Metals</label>
            {signatories.length === 0 ? (
              <p className="text-amber-400 text-sm bg-amber-900/20 border border-amber-700/30 rounded-lg px-4 py-3">
                No hay firmantes activos. Ve a{" "}
                <a href="/admin/signatories" className="underline">
                  Firmantes
                </a>{" "}
                para agregar uno.
              </p>
            ) : (
              <select
                value={signatoryId}
                onChange={(e) => setSignatoryId(e.target.value)}
                className={inputClass}
              >
                <option value="">Seleccionar firmante...</option>
                {signatories.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.full_name} — {s.position}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && (
            <div className="bg-red-900/20 border border-red-700/40 rounded-lg px-4 py-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-2.5 border border-[#2a2a2a] text-gray-400 rounded-lg hover:text-white hover:border-[#3a3a3a] transition-colors"
            >
              Atrás
            </button>
            <button
              onClick={handleSend}
              disabled={loading || !signatoryId}
              className="px-8 py-2.5 bg-[#C9A84C] text-black font-semibold rounded-lg hover:bg-[#b8973b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Generando PDF...
                </>
              ) : (
                "Enviar documento"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
