"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Upload, CheckCircle } from "lucide-react";

const baseStep1Schema = z.object({
  full_name: z.string().min(2, "Nombre requerido"),
  phone: z.string().min(6, "Teléfono requerido"),
  country: z.string().min(2, "País requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirm_password: z.string(),
});

const step2Schema = z.object({
  metal_type: z.enum(["oro", "cobre", "plata", "molibdeno", "sal", "otro"]),
  metal_state: z.enum(["colpa", "concentrado", "refinado", "dore", "otro"]),
  purity: z.string().optional(),
  humidity: z.string().optional(),
  quantity_kg: z.string().min(1, "Cantidad requerida"),
  origin_country: z.string().min(2, "País de origen requerido"),
  origin_region: z.string().min(2, "Región de origen requerida"),
  traceability: z.enum(["completa", "incompleta", "no_tengo"], {
    required_error: "Selecciona el nivel de trazabilidad",
  }),
  has_analysis: z.boolean().default(false),
  analysis_lab: z.string().optional(),
  notes: z.string().optional(),
});

const fullSchema = baseStep1Schema.merge(step2Schema).refine(
  (d) => d.password === d.confirm_password,
  { message: "Las contraseñas no coinciden", path: ["confirm_password"] }
);
type FormData = z.infer<typeof fullSchema>;

const inputCls =
  "w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder-gray-600";
const labelCls = "block text-sm font-medium text-gray-300 mb-1";
const errorCls = "text-red-400 text-xs mt-1";

const METAL_TYPES = [
  { value: "oro", label: "Oro" },
  { value: "cobre", label: "Cobre" },
  { value: "plata", label: "Plata" },
  { value: "molibdeno", label: "Molibdeno" },
  { value: "sal", label: "Sal" },
  { value: "otro", label: "Otro" },
];

const METAL_STATES = [
  { value: "colpa", label: "Colpa" },
  { value: "concentrado", label: "Concentrado" },
  { value: "refinado", label: "Refinado" },
  { value: "dore", label: "Doré" },
  { value: "otro", label: "Otro" },
];

function FileInput({
  label,
  hint,
  file,
  onChange,
}: {
  label: string;
  hint: string;
  file: File | null;
  onChange: (f: File | null) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <div
        onClick={() => ref.current?.click()}
        className={`w-full border-2 border-dashed rounded-md px-4 py-6 cursor-pointer transition-colors text-center ${
          file
            ? "border-[#C9A84C] bg-[#C9A84C]/5"
            : "border-[#2a2a2a] bg-[#1a1a1a] hover:border-[#C9A84C]/50"
        }`}
      >
        {file ? (
          <div className="flex items-center justify-center gap-2 text-[#C9A84C]">
            <CheckCircle size={16} />
            <span className="text-sm font-medium truncate max-w-[200px]">{file.name}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <Upload size={20} />
            <span className="text-sm">{hint}</span>
            <span className="text-xs text-gray-600">JPG, PNG o PDF — máx. 5MB</span>
          </div>
        )}
        <input
          ref={ref}
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </div>
    </div>
  );
}

export default function SellerRegistrationForm() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(fullSchema),
    defaultValues: { has_analysis: false },
  });

  const hasAnalysis = watch("has_analysis");
  const traceability = watch("traceability");

  const handleStep1Next = async () => {
    const valid = await trigger([
      "full_name", "phone", "country", "email", "password", "confirm_password",
    ]);
    if (valid) setStep(2);
  };

  const handleStep2Next = async () => {
    const valid = await trigger([
      "metal_type", "metal_state", "quantity_kg", "origin_country", "origin_region", "traceability",
    ]);
    if (valid) setStep(3);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        ...data,
        purity: data.purity ? parseFloat(data.purity) : undefined,
        humidity: data.humidity ? parseFloat(data.humidity) : undefined,
        quantity_kg: parseFloat(data.quantity_kg),
      };

      const res = await fetch("/api/register/seller", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error || "Error al enviar el formulario");
        return;
      }

      // Subir documentos KYC si se adjuntaron
      if (json.userId && (idDoc || selfie)) {
        const fd = new FormData();
        fd.append("userId", json.userId);
        if (idDoc) fd.append("id_document", idDoc);
        if (selfie) fd.append("selfie", selfie);
        await fetch("/api/kyc/upload", { method: "POST", body: fd });
      }

      setSubmitted(true);
    } catch {
      setServerError("Error de conexión. Por favor intente nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-[#C9A84C]/20 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Registro recibido</h3>
        <p className="text-gray-400 max-w-md mx-auto">
          Hemos recibido tu solicitud. Nuestro equipo revisará tu información y te contactará a la brevedad para completar el proceso.
        </p>
      </div>
    );
  }

  const STEP_LABELS = ["Información Personal", "Detalles del Material", "Verificación de Identidad"];

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">Paso {step} de 3</span>
          <span className="text-xs text-[#C9A84C]">{STEP_LABELS[step - 1]}</span>
        </div>
        <div className="h-1 bg-[#2a2a2a] rounded-full">
          <div
            className="h-1 bg-[#C9A84C] rounded-full transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* PASO 1 — Información personal */}
        {step === 1 && (
          <>
            <div>
              <label className={labelCls}>Nombre completo *</label>
              <input {...register("full_name")} className={inputCls} placeholder="Juan García" />
              {errors.full_name && <p className={errorCls}>{errors.full_name.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Teléfono *</label>
                <input {...register("phone")} className={inputCls} placeholder="+56 9 1234 5678" />
                {errors.phone && <p className={errorCls}>{errors.phone.message}</p>}
              </div>
              <div>
                <label className={labelCls}>País *</label>
                <input {...register("country")} className={inputCls} placeholder="Chile" />
                {errors.country && <p className={errorCls}>{errors.country.message}</p>}
              </div>
            </div>
            <div>
              <label className={labelCls}>Email *</label>
              <input {...register("email")} type="email" className={inputCls} placeholder="juan@empresa.com" />
              {errors.email && <p className={errorCls}>{errors.email.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Contraseña *</label>
              <input {...register("password")} type="password" className={inputCls} placeholder="Mínimo 8 caracteres" />
              {errors.password && <p className={errorCls}>{errors.password.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Confirmar contraseña *</label>
              <input {...register("confirm_password")} type="password" className={inputCls} placeholder="Repite tu contraseña" />
              {errors.confirm_password && <p className={errorCls}>{errors.confirm_password.message}</p>}
            </div>
            <button type="button" onClick={handleStep1Next}
              className="w-full bg-[#C9A84C] text-[#0A0A0A] font-semibold py-3 rounded-md hover:bg-[#b8973b] transition-colors mt-2">
              Continuar
            </button>
          </>
        )}

        {/* PASO 2 — Detalles del material */}
        {step === 2 && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Tipo de metal *</label>
                <select {...register("metal_type")} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {METAL_TYPES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                {errors.metal_type && <p className={errorCls}>{errors.metal_type.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Estado del metal *</label>
                <select {...register("metal_state")} className={inputCls}>
                  <option value="">Seleccionar...</option>
                  {METAL_STATES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
                {errors.metal_state && <p className={errorCls}>{errors.metal_state.message}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Pureza / Ley (%)</label>
                <input {...register("purity")} type="number" min="0" max="100" step="0.01" className={inputCls} placeholder="95.5" />
              </div>
              <div>
                <label className={labelCls}>Humedad (%)</label>
                <input {...register("humidity")} type="number" min="0" max="100" step="0.01" className={inputCls} placeholder="8" />
              </div>
            </div>
            <div>
              <label className={labelCls}>Cantidad disponible (kg) *</label>
              <input {...register("quantity_kg")} type="number" min="0" className={inputCls} placeholder="5000" />
              {errors.quantity_kg && <p className={errorCls}>{errors.quantity_kg.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>País de origen *</label>
                <input {...register("origin_country")} className={inputCls} placeholder="Chile" />
                {errors.origin_country && <p className={errorCls}>{errors.origin_country.message}</p>}
              </div>
              <div>
                <label className={labelCls}>Región de origen *</label>
                <input {...register("origin_region")} className={inputCls} placeholder="Atacama" />
                {errors.origin_region && <p className={errorCls}>{errors.origin_region.message}</p>}
              </div>
            </div>
            {/* Trazabilidad */}
            <div>
              <label className={labelCls}>Trazabilidad del material *</label>
              <p className="text-xs text-gray-500 mb-3">
                Indica el nivel de documentación de origen y cadena de custodia de tu material.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { value: "completa", label: "Completa", desc: "Origen y custodia documentados" },
                  { value: "incompleta", label: "Incompleta", desc: "Documentación parcial" },
                  { value: "no_tengo", label: "No tengo", desc: "Sin documentación de trazabilidad" },
                ] as const).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setValue("traceability", opt.value, { shouldValidate: true })}
                    className={`flex flex-col items-center text-center p-3 rounded-lg border transition-colors ${
                      traceability === opt.value
                        ? "bg-[#C9A84C]/10 border-[#C9A84C] text-[#C9A84C]"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-400 hover:border-[#C9A84C]/50"
                    }`}
                  >
                    <span className="text-sm font-semibold mb-1">{opt.label}</span>
                    <span className="text-xs leading-tight opacity-75">{opt.desc}</span>
                  </button>
                ))}
              </div>
              {errors.traceability && (
                <p className={errorCls}>{errors.traceability.message}</p>
              )}
            </div>

            <div>
              <label className={labelCls}>¿Tiene análisis de laboratorio?</label>
              <div className="flex items-center gap-3 mt-2">
                <button type="button" onClick={() => setValue("has_analysis", true)}
                  className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${hasAnalysis ? "bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]" : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:border-[#C9A84C]"}`}>
                  Sí
                </button>
                <button type="button" onClick={() => setValue("has_analysis", false)}
                  className={`flex-1 py-2 rounded-md border text-sm font-medium transition-colors ${!hasAnalysis ? "bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]" : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:border-[#C9A84C]"}`}>
                  No
                </button>
              </div>
            </div>
            {hasAnalysis && (
              <div>
                <label className={labelCls}>Nombre del laboratorio</label>
                <input {...register("analysis_lab")} className={inputCls} placeholder="Ej: SGS, Bureau Veritas" />
              </div>
            )}
            <div>
              <label className={labelCls}>Notas adicionales</label>
              <textarea {...register("notes")} rows={3} className={`${inputCls} resize-none`} placeholder="Información adicional sobre el material..." />
            </div>
            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(1)}
                className="flex-1 border border-[#2a2a2a] text-gray-300 font-semibold py-3 rounded-md hover:border-[#C9A84C] transition-colors">
                Atrás
              </button>
              <button type="button" onClick={handleStep2Next}
                className="flex-1 bg-[#C9A84C] text-[#0A0A0A] font-semibold py-3 rounded-md hover:bg-[#b8973b] transition-colors">
                Continuar
              </button>
            </div>
          </>
        )}

        {/* PASO 3 — Verificación de identidad (KYC) */}
        {step === 3 && (
          <>
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-md px-4 py-3 text-sm text-gray-400">
              Para garantizar la seguridad de las operaciones, solicitamos una verificación básica de identidad. Tus documentos serán revisados de forma confidencial por nuestro equipo.
            </div>

            <FileInput
              label="Foto del documento de identidad (carnet o pasaporte) *"
              hint="Sube una foto clara del frente de tu documento"
              file={idDoc}
              onChange={setIdDoc}
            />

            <FileInput
              label="Selfie sosteniendo el documento *"
              hint="Foto tuya junto a tu documento de identidad"
              file={selfie}
              onChange={setSelfie}
            />

            {serverError && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-md px-4 py-3 text-sm">
                {serverError}
              </div>
            )}

            <div className="flex gap-3">
              <button type="button" onClick={() => setStep(2)}
                className="flex-1 border border-[#2a2a2a] text-gray-300 font-semibold py-3 rounded-md hover:border-[#C9A84C] transition-colors">
                Atrás
              </button>
              <button type="submit" disabled={isSubmitting || !idDoc || !selfie}
                className="flex-1 bg-[#C9A84C] text-[#0A0A0A] font-semibold py-3 rounded-md hover:bg-[#b8973b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                {isSubmitting ? "Enviando..." : "Registrarme"}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
