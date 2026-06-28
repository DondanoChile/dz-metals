import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { redirect } from "next/navigation";
import SendDocumentForm from "@/components/admin/SendDocumentForm";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
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
