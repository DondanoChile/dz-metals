import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
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

  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "no session" });

  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA"
  );

  const { data: userRow, error } = await adminClient
    .from("users")
    .select("id, email, role, status")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ auth_id: user.id, auth_email: user.email, db_row: userRow, db_error: error });
}
