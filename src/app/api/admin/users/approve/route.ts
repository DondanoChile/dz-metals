import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const formData = await request.formData();
  const userId = formData.get("userId") as string;
  const status = formData.get("status") as string;

  if (!userId || !["active", "rejected"].includes(status)) {
    return NextResponse.redirect(new URL("/es/admin", request.url));
  }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  await admin.from("users").update({ status }).eq("id", userId);

  return NextResponse.redirect(new URL(request.headers.get("referer") ?? "/es/admin", request.url));
}
