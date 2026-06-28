"use client";

import { useState, type FormEvent } from "react";
import { Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

type Status = "idle" | "loading" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Server error");
      setStatus("success");
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16 bg-[#141414] border border-[#2A2A2A] px-6 text-center">
        <CheckCircle size={32} className="text-emerald-400" />
        <h3 className="font-cormorant text-2xl font-semibold text-[#F5F0E8]">
          Mensaje enviado
        </h3>
        <p className="text-sm text-[#9A9A8A] font-inter max-w-sm">
          Un broker revisará tu consulta y responderá dentro de las próximas 24
          horas hábiles.
        </p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-4 text-xs font-mono text-[#C9A84C] hover:underline"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  const inputClass =
    "w-full bg-[#141414] border border-[#2A2A2A] text-[#F5F0E8] text-sm font-inter px-4 py-3 placeholder-[#9A9A8A]/50 focus:outline-none focus:border-[#C9A84C]/60 transition-colors";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[#9A9A8A] tracking-wide uppercase">
            Nombre *
          </label>
          <input
            required
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Su nombre completo"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[#9A9A8A] tracking-wide uppercase">
            Email *
          </label>
          <input
            required
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="su@empresa.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[#9A9A8A] tracking-wide uppercase">
            Teléfono
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder="+56 9 XXXX XXXX"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-mono text-[#9A9A8A] tracking-wide uppercase">
            Asunto
          </label>
          <select
            name="subject"
            value={form.subject}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Seleccionar...</option>
            <option value="compra">Quiero comprar</option>
            <option value="venta">Quiero vender</option>
            <option value="consulta">Consulta general</option>
            <option value="legal">Consulta legal/documental</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-mono text-[#9A9A8A] tracking-wide uppercase">
          Mensaje *
        </label>
        <textarea
          required
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={5}
          placeholder="Describa brevemente su necesidad o consulta..."
          className={inputClass + " resize-none"}
        />
      </div>

      {status === "error" && (
        <div className="flex items-center gap-2 text-red-400 text-xs font-mono">
          <AlertCircle size={14} />
          Error al enviar el mensaje. Por favor intente nuevamente.
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="flex items-center justify-center gap-2 px-6 py-3 bg-[#C9A84C] text-[#0A0A0A] font-inter text-sm font-medium tracking-wide hover:bg-[#b8973d] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "loading" ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Send size={16} />
            Enviar mensaje
          </>
        )}
      </button>

      <p className="text-xs text-[#9A9A8A] font-inter">
        Sus datos serán tratados con total confidencialidad y no serán compartidos
        con terceros sin su consentimiento.
      </p>
    </form>
  );
}
