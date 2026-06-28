import { createClient } from "@supabase/supabase-js";
import SignatoriesManager from "@/components/admin/SignatoriesManager";

async function getSignatories() {
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data } = await adminClient
    .from("signatories")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data) return [];

  // Resolve signed URLs for signature previews
  const resolved = await Promise.all(
    data.map(async (s) => {
      if (s.signature_url && !s.signature_url.startsWith("http")) {
        const { data: signed } = await adminClient.storage
          .from("signatures")
          .createSignedUrl(s.signature_url, 3600);
        return { ...s, signature_url: signed?.signedUrl ?? null };
      }
      return s;
    })
  );

  return resolved;
}

export default async function SignatoriesPage() {
  const signatories = await getSignatories();

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">Firmantes</h1>
        <p className="text-gray-400 text-sm mt-1">
          Personas autorizadas para firmar documentos en nombre de DZ Metals.
        </p>
      </div>
      <SignatoriesManager initialSignatories={signatories} />
    </div>
  );
}
