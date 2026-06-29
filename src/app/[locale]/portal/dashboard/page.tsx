import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const STATUS_STEPS = [
  { key: "new", label: "Nuevo", description: "Operación iniciada" },
  { key: "contacted", label: "Contactado", description: "Broker en contacto" },
  { key: "nda_sent", label: "NDA Enviado", description: "Acuerdo de confidencialidad enviado" },
  { key: "negotiating", label: "Negociando", description: "En proceso de negociación" },
  { key: "closed", label: "Cerrado", description: "Operación completada" },
];

const STATUS_ORDER = ["new", "contacted", "nda_sent", "negotiating", "closed"];

async function getCurrentUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTU0NjAsImV4cCI6MjA5ODEzMTQ2MH0.39BlwOoBMSOaqYb4RMxEvr1valhW63SJLXDeOrsdYRA",
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export default async function PortalDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Fetch operations for this user (as seller or buyer)
  const { data: operations } = await supabaseAdmin
    .from("operations")
    .select("*, seller:users!operations_seller_id_fkey(full_name), buyer:users!operations_buyer_id_fkey(full_name)")
    .or(`seller_id.eq.${user.id},buyer_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Fetch pending document requests
  const { data: pendingRequests } = await supabaseAdmin
    .from("document_requests")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "pending");

  const mainOperation = operations?.[0] ?? null;
  const currentStepIndex = mainOperation
    ? STATUS_ORDER.indexOf(mainOperation.status)
    : -1;

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
      <p className="text-gray-500 mb-8">Estado de tu operación</p>

      {/* Pending document requests banner */}
      {pendingRequests && pendingRequests.length > 0 && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 mb-8 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          <div>
            <p className="text-yellow-400 font-medium text-sm">
              {pendingRequests.length === 1
                ? "El broker solicita 1 documento"
                : `El broker solicita ${pendingRequests.length} documentos`}
            </p>
            <p className="text-yellow-600 text-xs mt-0.5">
              {pendingRequests.map((r) => r.doc_type).join(", ")}
            </p>
            <a href="/portal/documents" className="text-[#C9A84C] text-xs hover:underline mt-1 inline-block">
              Ir a documentos →
            </a>
          </div>
        </div>
      )}

      {!mainOperation ? (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-400">No tienes operaciones activas.</p>
          <p className="text-gray-600 text-sm mt-1">Nuestro equipo creará una operación una vez revisada tu solicitud.</p>
        </div>
      ) : (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-8">
          {/* Operation header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-xl font-semibold text-white">
                Operación — {mainOperation.metal_type}
              </h2>
              <span className="text-sm text-gray-500">
                {mainOperation.quantity_kg?.toLocaleString()} kg
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Creada el {new Date(mainOperation.created_at).toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" })}
            </p>
          </div>

          {/* Vertical timeline */}
          <div className="space-y-0">
            {STATUS_STEPS.map((step, index) => {
              const isDone = index < currentStepIndex;
              const isCurrent = index === currentStepIndex;
              const isPending = index > currentStepIndex;

              return (
                <div key={step.key} className="flex gap-4">
                  {/* Left: connector + circle */}
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        isDone
                          ? "bg-[#C9A84C]"
                          : isCurrent
                          ? "bg-[#C9A84C]/20 border-2 border-[#C9A84C]"
                          : "bg-[#2a2a2a] border border-[#3a3a3a]"
                      }`}
                    >
                      {isDone ? (
                        <svg className="w-4 h-4 text-[#0A0A0A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : isCurrent ? (
                        <div className="w-3 h-3 rounded-full bg-[#C9A84C]" />
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#3a3a3a]" />
                      )}
                    </div>
                    {index < STATUS_STEPS.length - 1 && (
                      <div
                        className={`w-0.5 h-10 mt-1 ${
                          isDone ? "bg-[#C9A84C]" : "bg-[#2a2a2a]"
                        }`}
                      />
                    )}
                  </div>

                  {/* Right: content */}
                  <div className="pb-10 pt-1">
                    <p
                      className={`font-medium text-sm ${
                        isCurrent
                          ? "text-[#C9A84C]"
                          : isDone
                          ? "text-white"
                          : "text-gray-600"
                      }`}
                    >
                      {step.label}
                      {isCurrent && (
                        <span className="ml-2 text-xs bg-[#C9A84C]/20 text-[#C9A84C] px-2 py-0.5 rounded-full">
                          Actual
                        </span>
                      )}
                    </p>
                    <p className={`text-xs mt-0.5 ${isPending ? "text-gray-700" : "text-gray-500"}`}>
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Broker notes */}
          {mainOperation.broker_notes && (
            <div className="mt-4 pt-6 border-t border-[#2a2a2a]">
              <p className="text-sm text-gray-400 font-medium mb-2">Notas del broker</p>
              <p className="text-gray-300 text-sm">{mainOperation.broker_notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Other operations */}
      {operations && operations.length > 1 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-400 mb-3">Otras operaciones</h3>
          <div className="space-y-2">
            {operations.slice(1).map((op) => (
              <div
                key={op.id}
                className="bg-[#141414] border border-[#2a2a2a] rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div>
                  <p className="text-white text-sm font-medium">{op.metal_type}</p>
                  <p className="text-gray-500 text-xs">{op.quantity_kg?.toLocaleString()} kg</p>
                </div>
                <span className="text-xs text-gray-400 capitalize">{op.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
