import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const signatoryId = formData.get("signatoryId") as string | null;

  if (!file || !signatoryId) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = `${signatoryId}/signature.${ext}`;
  const bytes = await file.arrayBuffer();

  // Upload to storage
  const { error: uploadError } = await admin.storage
    .from("signatures")
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Get public URL (bucket is private so we use signed URL stored as path)
  const signature_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/signatures/${path}`;

  // Update signatory record
  const { data, error: dbError } = await admin
    .from("signatories")
    .update({ signature_url: path })
    .eq("id", signatoryId)
    .select()
    .single();

  if (dbError) {
    return NextResponse.json({ error: dbError.message }, { status: 500 });
  }

  // Return a signed URL so the UI can preview it
  const { data: signed } = await admin.storage
    .from("signatures")
    .createSignedUrl(path, 3600);

  return NextResponse.json({
    ...data,
    signature_url: signed?.signedUrl ?? signature_url,
  });
}
