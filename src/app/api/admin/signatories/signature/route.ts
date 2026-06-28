import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
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
