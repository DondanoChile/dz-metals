import Link from "next/link";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { Users, TrendingUp } from "lucide-react";

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-24">
        <div className="text-center mb-12">
          <span className="text-xs font-mono tracking-[0.25em] text-[#C9A84C] uppercase">
            Registro
          </span>
          <h1 className="font-cormorant text-4xl sm:text-5xl font-semibold text-[#F5F0E8] mt-3">
            ¿Cómo desea operar?
          </h1>
          <p className="mt-4 text-[#9A9A8A] font-inter text-sm max-w-md mx-auto">
            Seleccione su perfil para comenzar el proceso de registro.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-2xl">
          <Link
            href="/register/buyer"
            className="group bg-[#141414] border border-[#2A2A2A] rounded-lg p-8 hover:border-[#C9A84C]/60 transition-all duration-300 flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-[#C9A84C]/10 flex items-center justify-center group-hover:bg-[#C9A84C]/20 transition-colors">
              <TrendingUp size={24} className="text-[#C9A84C]" />
            </div>
            <div>
              <h2 className="font-cormorant text-2xl font-semibold text-[#F5F0E8]">
                Soy Comprador
              </h2>
              <p className="mt-2 text-sm text-[#9A9A8A] font-inter">
                Quiero acceder a fuentes de metales y minerales chilenos.
              </p>
            </div>
            <span className="text-xs font-mono text-[#C9A84C] tracking-widest uppercase mt-2">
              Registrarme →
            </span>
          </Link>

          <Link
            href="/register/seller"
            className="group bg-[#141414] border border-[#2A2A2A] rounded-lg p-8 hover:border-[#C9A84C]/60 transition-all duration-300 flex flex-col items-center text-center gap-4"
          >
            <div className="w-14 h-14 rounded-full bg-[#C9A84C]/10 flex items-center justify-center group-hover:bg-[#C9A84C]/20 transition-colors">
              <Users size={24} className="text-[#C9A84C]" />
            </div>
            <div>
              <h2 className="font-cormorant text-2xl font-semibold text-[#F5F0E8]">
                Soy Vendedor
              </h2>
              <p className="mt-2 text-sm text-[#9A9A8A] font-inter">
                Quiero conectar mi producción con compradores internacionales.
              </p>
            </div>
            <span className="text-xs font-mono text-[#C9A84C] tracking-widest uppercase mt-2">
              Registrarme →
            </span>
          </Link>
        </div>

        <p className="mt-10 text-xs text-[#9A9A8A] font-inter text-center max-w-sm">
          Al registrarse acepta nuestros{" "}
          <Link href="/legal#terminos" className="text-[#C9A84C] hover:underline">
            Términos de Uso
          </Link>{" "}
          y{" "}
          <Link href="/legal#privacidad" className="text-[#C9A84C] hover:underline">
            Política de Privacidad
          </Link>
          .
        </p>
      </main>
      <Footer />
    </>
  );
}
