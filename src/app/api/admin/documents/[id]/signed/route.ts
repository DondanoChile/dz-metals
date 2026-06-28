import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

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

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify admin
    const { data: userData } = await adminClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userData?.role !== "admin") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Get document
    const { data: doc } = await adminClient
      .from("generated_documents")
      .select("id, signed_document_path, status")
      .eq("id", id)
      .single();

    if (!doc?.signed_document_path) {
      return NextResponse.json({ error: "No hay documento firmado" }, { status: 404 });
    }

    // Generate signed URL (1 hour)
    const { data: signedData, error: signError } = await adminClient.storage
      .from("signed-docs")
      .createSignedUrl(doc.signed_document_path, 3600);

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json({ error: "Error al generar URL" }, { status: 500 });
    }

    // Mark as completed when admin downloads
    if (doc.status === "signed") {
      await adminClient
        .from("generated_documents")
        .update({ status: "completed" })
        .eq("id", id);
    }

    return NextResponse.redirect(signedData.signedUrl);
  } catch (err) {
    console.error("Signed doc download error:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
