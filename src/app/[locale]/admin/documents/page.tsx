import { createClient } from "@supabase/supabase-js";
import Link from "next/link";

async function getDocuments() {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await adminClient
    .from("generated_documents")
    .select(
      `id, language, status, sent_at, viewed_at, created_at, signed_at, signed_document_path,
       template:document_templates(name_es, name_en, code, requires_client_signature),
       user:users(full_name, email),
       signatory:signatories(full_name)`
    )
    .order("created_at", { ascending: false });

  return data ?? [];
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; cls: string }> = {
    sent:      { label: "Enviado",           cls: "bg-blue-900/30 text-blue-400 border border-blue-700/40" },
    viewed:    { label: "Visto",             cls: "bg-yellow-900/30 text-yellow-400 border border-yellow-700/40" },
    downloaded:{ label: "Descargado",        cls: "bg-purple-900/30 text-purple-400 border border-purple-700/40" },
    signed:    { label: "⚡ Firmado",         cls: "bg-emerald-900/40 text-emerald-300 border border-emerald-500/60 font-semibold" },
    completed: { label: "Completado",        cls: "bg-gray-800 text-gray-400 border border-gray-700" },
  };
  const { label, cls } = config[status] ?? config.sent;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${cls}`}>
      {label}
    </span>
  );
}

const LANG_LABELS: Record<string, string> = {
  es: "Español",
  en: "English",
  both: "Ambos",
};

export default async function AdminDocumentsPage() {
  const documents = await getDocuments();
  const signedCount = documents.filter((d: any) => d.status === "signed" && d.signed_document_path).length;

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Documentos</h1>
          <p className="text-gray-400 text-sm mt-1">
            Documentos generados y enviados a usuarios.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/documents/templates"
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-[#2a2a2a] text-gray-300 hover:text-white hover:border-[#C9A84C] font-medium rounded-lg transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Plantillas
          </Link>
          <Link
            href="/admin/documents/send"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C9A84C] text-black font-medium rounded-lg hover:bg-[#b8973b] transition-colors text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Enviar Documento
          </Link>
        </div>
      </div>

      {/* Alert: signed documents pending review */}
      {signedCount > 0 && (
        <div className="mb-6 flex items-center gap-3 bg-emerald-900/20 border border-emerald-700/50 rounded-xl px-5 py-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-emerald-300 text-sm">
            <span className="font-semibold">{signedCount} documento{signedCount > 1 ? "s" : ""} firmado{signedCount > 1 ? "s" : ""}</span> pendiente{signedCount > 1 ? "s" : ""} de revisión.
          </p>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-12 text-center">
          <div className="w-12 h-12 rounded-full bg-[#2a2a2a] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-400">No hay documentos enviados aún.</p>
          <p className="text-gray-600 text-sm mt-1">
            Usa el botón "Enviar Documento" para generar y enviar documentos.
          </p>
        </div>
      ) : (
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2a2a2a] text-left">
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Destinatario</th>
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Documento</th>
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Idioma</th>
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-4 text-xs font-mono text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2a2a2a]">
              {documents.map((doc: any) => (
                <tr
                  key={doc.id}
                  className={`hover:bg-[#1a1a1a] transition-colors ${doc.status === "signed" ? "bg-emerald-950/20" : ""}`}
                >
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{doc.user?.full_name ?? "—"}</p>
                    <p className="text-gray-500 text-xs">{doc.user?.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-gray-300">{doc.template?.name_es ?? "—"}</p>
                    <p className="text-gray-600 text-xs">{doc.template?.code}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-400 text-xs">{LANG_LABELS[doc.language] ?? doc.language}</span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={doc.status} />
                    {doc.signed_at && (
                      <p className="text-gray-600 text-xs mt-1">
                        Firmado {new Date(doc.signed_at).toLocaleDateString("es-CL")}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-xs">
                    {new Date(doc.sent_at ?? doc.created_at).toLocaleDateString("es-CL")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {/* Ver PDF original */}
                      <a
                        href={`/api/admin/documents/${doc.id}/pdf`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[#C9A84C] hover:text-[#b8973b] text-xs transition-colors"
                        title="Ver PDF original"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Ver PDF
                      </a>

                      {/* Descargar documento firmado por el cliente */}
                      {doc.signed_document_path && (
                        <a
                          href={`/api/admin/documents/${doc.id}/signed`}
                          className="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 text-xs transition-colors font-medium"
                          title="Descargar documento firmado por el cliente"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Firmado ↓
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
