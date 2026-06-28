import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const cookieStore = await cookies();

  // Cliente para leer la sesión activa
  const supabase = createServerClient(
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

  const { data: { user } } = await supabase.auth.getUser();
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  if (!user) {
    return NextResponse.redirect(new URL("/es/login", base));
  }

  // Cliente admin para leer el rol sin restricciones RLS
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: userRow } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role === "admin") {
    return NextResponse.redirect(new URL("/es/admin", base));
  }

  return NextResponse.redirect(new URL("/es/portal/dashboard", base));
}
