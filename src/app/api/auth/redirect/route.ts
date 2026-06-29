import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY, SITE_URL } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
  });

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/es/login", SITE_URL));
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

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
