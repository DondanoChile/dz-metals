import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const userId = formData.get("userId") as string;
    const idDoc = formData.get("id_document") as File | null;
    const selfie = formData.get("selfie") as File | null;

    if (!userId) {
      return NextResponse.json({ error: "userId requerido" }, { status: 400 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    const urls: { kyc_id_url?: string; kyc_selfie_url?: string } = {};

    if (idDoc && idDoc.size > 0) {
      const ext = idDoc.name.split(".").pop() ?? "jpg";
      const path = `${userId}/id_document.${ext}`;
      const { error } = await adminClient.storage
        .from("kyc")
        .upload(path, idDoc, { upsert: true, contentType: idDoc.type });
      if (!error) {
        const { data } = adminClient.storage.from("kyc").getPublicUrl(path);
        urls.kyc_id_url = data.publicUrl;
      }
    }

    if (selfie && selfie.size > 0) {
      const ext = selfie.name.split(".").pop() ?? "jpg";
      const path = `${userId}/selfie.${ext}`;
      const { error } = await adminClient.storage
        .from("kyc")
        .upload(path, selfie, { upsert: true, contentType: selfie.type });
      if (!error) {
        const { data } = adminClient.storage.from("kyc").getPublicUrl(path);
        urls.kyc_selfie_url = data.publicUrl;
      }
    }

    if (Object.keys(urls).length > 0) {
      await adminClient.from("users").update(urls).eq("id", userId);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("KYC upload error:", error);
    return NextResponse.json({ error: "Error al subir documentos" }, { status: 500 });
  }
}
