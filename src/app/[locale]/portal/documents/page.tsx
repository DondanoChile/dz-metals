import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import UploadSignedDocument from "@/components/portal/UploadSignedDocument";

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

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    sent: {
      label: "Pendiente",
      className: "bg-blue-900/30 text-blue-400 border border-blue-700/40",
    },
    viewed: {
      label: "Visto",
      className: "bg-yellow-900/30 text-yellow-400 border border-yellow-700/40",
    },
    downloaded: {
      label: "Descargado",
      className: "bg-purple-900/30 text-purple-400 border border-purple-700/40",
    },
    signed: {
      label: "Firmado — en revisión",
      className: "bg-emerald-900/30 text-emerald-400 border border-emerald-700/40",
    },
    completed: {
      label: "Completado",
      className: "bg-gray-800 text-gray-400 border border-gray-700",
    },
  };
  const { label, className } = config[status] ?? config.sent;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}>
      {label}
    </span>
  );
}

const LANG_LABELS: Record<string, string> = {
  es: "Español",
  en: "English",
  both: "Español + English",
};

export default async function PortalDocumentsPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("preferred_language")
    .eq("id", user.id)
    .single();

  const preferredLang: string = userData?.preferred_language ?? "es";

  const { data: documents } = await supabaseAdmin
    .from("generated_documents")
    .select(
      `id, language, status, sent_at, viewed_at, created_at, storage_path, signed_document_path,
       template:document_templates(name_es, name_en, code, requires_client_signature)`
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const docs = documents ?? [];

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold text-white mb-2">Documentos</h1>
      <p className="text-gray-500 mb-8">
        Documentos oficiales enviados por DZ Metals para tu revisión y firma.
      </p>

      {docs.length === 0 ? (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400">No tienes documentos aún.</p>
          <p className="text-gray-600 text-sm mt-1">
            DZ Metals te enviará documentos a medida que avance tu operación.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {docs.map((doc: any) => {
            const templateName =
              preferredLang === "en"
                ? (doc.template?.name_en ?? doc.template?.name_es ?? "—")
                : (doc.template?.name_es ?? doc.template?.name_en ?? "—");

            const isSigned = doc.status === "signed" || doc.status === "completed";
            const requiresSignature = doc.template?.requires_client_signature !== false;
            const pdfUrl = `/api/admin/documents/${doc.id}/pdf`;

            return (
              <div
                key={doc.id}
                className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-5 hover:border-[#3a3a3a] transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  {/* Icon + info */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">{templateName}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-gray-500 text-xs">
                          {new Date(doc.sent_at ?? doc.created_at).toLocaleDateString("es-CL", {
                            year: "numeric", month: "long", day: "numeric",
                          })}
                        </p>
                        <span className="text-gray-700 text-xs">·</span>
                        <p className="text-gray-500 text-xs">{LANG_LABELS[doc.language] ?? doc.language}</p>
                      </div>
                    </div>
                  </div>

                  {/* Status + actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={doc.status} />
                  </div>
                </div>

                {/* Action buttons row */}
                {doc.storage_path && (
                  <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#2a2a2a]">
                    {/* Ver */}
                    <a
                      href={pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 text-[#C9A84C] hover:bg-[#C9A84C]/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      Ver
                    </a>

                    {/* Descargar */}
                    <a
                      href={pdfUrl}
                      download
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-white/5 border border-[#3a3a3a] text-gray-300 hover:text-white hover:border-[#C9A84C]/50 rounded-lg text-sm font-medium transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Descargar
                    </a>

                    {/* Subir firmado — solo si el template lo requiere */}
                    {requiresSignature && !isSigned && (
                      <UploadSignedDocument
                        documentId={doc.id}
                        documentName={templateName}
                        alreadySigned={false}
                      />
                    )}

                    {/* Ya firmado */}
                    {requiresSignature && isSigned && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-2 text-emerald-400 text-sm">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Documento firmado enviado
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
