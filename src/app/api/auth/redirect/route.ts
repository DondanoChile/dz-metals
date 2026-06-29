import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTU0NjAsImV4cCI6MjA5ODEzMTQ2MH0.39BlwOoBMSOaqYb4RMxEvr1valhW63SJLXDeOrsdYRA";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dz-metals.vercel.app";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();

  // Cliente para leer la sesión activa
  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
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

  if (!user) {
    return NextResponse.redirect(new URL("/es/login", SITE_URL));
  }

  // Cliente admin para leer el rol sin restricciones RLS
  const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

  const { data: userRow } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role === "admin") {
    return NextResponse.redirect(new URL("/es/admin", SITE_URL));
  }

  return NextResponse.redirect(new URL("/es/portal/dashboard", SITE_URL));
}
