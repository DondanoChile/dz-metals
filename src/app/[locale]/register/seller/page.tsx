import SellerRegistrationForm from "@/components/forms/SellerRegistrationForm";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export const metadata = {
  title: "Registro de Vendedor | DZ Metals",
  description: "Regístrate como vendedor en DZ Metals para conectar con compradores internacionales.",
};

export default function SellerRegisterPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-[#0A0A0A] py-20">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Page header */}
          <div className="text-center mb-12">
            <p className="text-[#C9A84C] text-sm font-medium tracking-widest uppercase mb-3">
              Portal de Clientes
            </p>
            <h1 className="text-4xl font-bold text-white mb-4">
              Registro de Vendedor
            </h1>
            <p className="text-gray-400 max-w-md mx-auto">
              Complete el formulario para registrar su material y conectarse con compradores internacionales. Nuestro equipo revisará su información a la brevedad.
            </p>
          </div>

          {/* Form card */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-8">
            <SellerRegistrationForm />
          </div>

          {/* Login link */}
          <p className="text-center text-gray-500 text-sm mt-6">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-[#C9A84C] hover:underline">
              Iniciar sesión
            </a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
