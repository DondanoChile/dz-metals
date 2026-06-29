import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import SendDocumentForm from "@/components/admin/SendDocumentForm";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const authClient = createServerClient(
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
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return false;

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA"
  );
  const { data } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role === "admin";
}

async function getData() {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA"
  );

  const [{ data: templates }, { data: users }, { data: signatories }] = await Promise.all([
    adminClient
      .from("document_templates")
      .select("id, code, name_es, name_en, fields, has_exclusivity_clause, has_traceability_field")
      .eq("is_active", true)
      .order("name_es"),
    adminClient
      .from("users")
      .select("id, full_name, email, role")
      .in("role", ["buyer", "seller"])
      .eq("status", "active")
      .order("full_name"),
    adminClient
      .from("signatories")
      .select("id, full_name, position, rut")
      .eq("is_active", true)
      .order("full_name"),
  ]);

  return {
    templates: templates ?? [],
    users: users ?? [],
    signatories: signatories ?? [],
  };
}

export default async function SendDocumentPage() {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) redirect("/login");

  const { templates, users, signatories } = await getData();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Enviar Documento</h1>
        <p className="text-gray-400 text-sm mt-1">
          Genera y envía un documento oficial al portal del usuario.
        </p>
      </div>
      <SendDocumentForm
        templates={templates}
        users={users}
        signatories={signatories}
      />
    </div>
  );
}
