import { createClient } from "@supabase/supabase-js";
import TemplateEditor from "@/components/admin/TemplateEditor";

async function getTemplates() {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data } = await admin
    .from("document_templates")
    .select("id, code, name_es, name_en, content_es, content_en, fields, has_exclusivity_clause, has_traceability_field")
    .eq("is_active", true)
    .order("name_es");

  return (data ?? []).map((t) => ({
    ...t,
    fields: Array.isArray(t.fields) ? t.fields : JSON.parse(t.fields ?? "[]"),
  }));
}

export default async function DocumentTemplatesPage() {
  const templates = await getTemplates();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Plantillas de Documentos</h1>
        <p className="text-gray-400 text-sm mt-1">
          Carga el contenido de cada documento. Usa variables como <code className="text-[#C9A84C]">{"{{nombre_cliente}}"}</code> para datos dinámicos.
        </p>
      </div>
      <TemplateEditor templates={templates} />
    </div>
  );
}
