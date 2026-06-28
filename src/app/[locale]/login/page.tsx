"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "@/navigation";
import { createClient } from "@/lib/supabase/client";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("Email o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    // Ruta servidor que verifica el rol y redirige correctamente
    window.location.href = "/api/auth/redirect";
  }

  const inputCls = "w-full bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-md px-4 py-3 focus:outline-none focus:border-[#C9A84C] transition-colors placeholder-gray-600";
  const labelCls = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-24">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <span className="text-xs font-mono tracking-[0.25em] text-[#C9A84C] uppercase">
              Acceso
            </span>
            <h1 className="font-cormorant text-4xl font-semibold text-[#F5F0E8] mt-3">
              Iniciar Sesión
            </h1>
            <p className="mt-3 text-sm text-[#9A9A8A] font-inter">
              Ingrese sus credenciales para acceder a su panel.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="juan@empresa.com"
                required
              />
            </div>

            <div>
              <label className={labelCls}>Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 rounded-md px-4 py-3 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] text-[#0A0A0A] font-semibold py-3 rounded-md hover:bg-[#b8973b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Ingresando..." : "Ingresar"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-[#9A9A8A] font-inter">
            ¿No tiene cuenta?{" "}
            <Link href="/register" className="text-[#C9A84C] hover:underline">
              Regístrese aquí
            </Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
