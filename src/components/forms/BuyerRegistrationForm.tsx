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
  metals_interested: z.array(z.string()).min(1, "Seleccione al menos un metal"),
  min_purity: z.string().optional(),
  quantity_needed_kg: z.string().optional(),
  destination_country: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

const fullSchema = baseStep1Schema.merge(step2Schema).refine(
  (d) => d.password === d.confirm_password,
  { message: "Las contraseñas no coinciden", path: ["confirm_password"] }
);
type FormData = z.infer<typeof fullSchema>;

const METALS = [
  { value: "oro", label: "Oro" },
  { value: "cobre", label: "Cobre" },
  { value: "plata", label: "Plata" },
  { value: "molibdeno", label: "Molibdeno" },
  { value: "sal", label: "Sal" },
];

const PAYMENT_METHODS = [
  "Transferencia bancaria",
  "Carta de crédito (L/C)",
  "SWIFT",
  "Escrow",
  "Otro",
];

const inputCls =
  "w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder-gray-600";
const labelCls = "block text-sm font-medium text-gray-300 mb-1";
const errorCls = "text-red-400 text-xs mt-1";

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

export default function BuyerRegistrationForm() {
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
    defaultValues: { metals_interested: [] },
  });

  const metalsInterested = watch("metals_interested") || [];

  const toggleMetal = (value: string) => {
    const current = metalsInterested;
    if (current.includes(value)) {
      setValue("metals_interested", current.filter((m) => m !== value));
    } else {
      setValue("metals_interested", [...current, value]);
    }
  };

  const handleStep1Next = async () => {
    const valid = await trigger([
      "full_name", "phone", "country", "email", "password", "confirm_password",
    ]);
    if (valid) setStep(2);
  };

  const handleStep2Next = async () => {
    const valid = await trigger(["metals_interested"]);
    if (valid) setStep(3);
  };

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const payload = {
        ...data,
        min_purity: data.min_purity ? parseFloat(data.min_purity) : undefined,
        quantity_needed_kg: data.quantity_needed_kg
          ? parseFloat(data.quantity_needed_kg)
          : undefined,
      };

      const res = await fetch("/api/register/buyer", {
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

  const STEP_LABELS = ["Información Personal", "Intereses de Compra", "Verificación de Identidad"];

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

        {/* PASO 2 — Intereses de compra */}
        {step === 2 && (
          <>
            <div>
              <label className={labelCls}>Metales de interés *</label>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {METALS.map((metal) => (
                  <button key={metal.value} type="button" onClick={() => toggleMetal(metal.value)}
                    className={`py-2 px-3 rounded-md border text-sm font-medium transition-colors ${
                      metalsInterested.includes(metal.value)
                        ? "bg-[#C9A84C] border-[#C9A84C] text-[#0A0A0A]"
                        : "bg-[#1a1a1a] border-[#2a2a2a] text-gray-300 hover:border-[#C9A84C]"
                    }`}>
                    {metal.label}
                  </button>
                ))}
              </div>
              {errors.metals_interested && <p className={errorCls}>{errors.metals_interested.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Pureza mínima (%)</label>
                <input {...register("min_purity")} type="number" min="0" max="100" className={inputCls} placeholder="95" />
              </div>
              <div>
                <label className={labelCls}>Cantidad necesaria (kg)</label>
                <input {...register("quantity_needed_kg")} type="number" min="0" className={inputCls} placeholder="1000" />
              </div>
            </div>
            <div>
              <label className={labelCls}>País de destino</label>
              <input {...register("destination_country")} className={inputCls} placeholder="China" />
            </div>
            <div>
              <label className={labelCls}>Método de pago preferido</label>
              <select {...register("payment_method")} className={inputCls}>
                <option value="">Seleccionar...</option>
                {PAYMENT_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className={labelCls}>Notas adicionales</label>
              <textarea {...register("notes")} rows={3} className={`${inputCls} resize-none`}
                placeholder="Información adicional relevante..." />
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
