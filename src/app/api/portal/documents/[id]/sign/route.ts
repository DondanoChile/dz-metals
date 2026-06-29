import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify session
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

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify the document belongs to this user
    const { data: doc, error: docError } = await adminClient
      .from("generated_documents")
      .select("id, user_id, status, storage_path")
      .eq("id", id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });
    }

    if (doc.user_id !== user.id) {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Parse the uploaded file
    const formData = await req.formData();
    const file = formData.get("signed_document") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No se recibió ningún archivo" }, { status: 400 });
    }

    // Validate file type and size
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Solo se permiten archivos PDF, JPG o PNG" },
        { status: 400 }
      );
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "El archivo no puede superar los 10MB" },
        { status: 400 }
      );
    }

    // Upload to signed-docs bucket
    const ext = file.name.split(".").pop() ?? "pdf";
    const storagePath = `${id}/firmado.${ext}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Ensure bucket exists
    const { error: uploadError } = await adminClient.storage
      .from("signed-docs")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
    }

    // Update document record
    const { error: updateError } = await adminClient
      .from("generated_documents")
      .update({
        status: "signed",
        signed_document_path: storagePath,
        signed_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("Update error:", updateError);
      return NextResponse.json({ error: "Error al actualizar el documento" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Sign upload error:", err);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
