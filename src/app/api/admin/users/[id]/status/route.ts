import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import { Resend } from "resend";

const statusSchema = z.object({
  status: z.enum(["pending", "active", "rejected"]),
});

async function getAdminUser() {
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

  const { data: { user }, error } = await authClient.auth.getUser();
  if (error || !user) return null;

  // Use service role to bypass RLS when checking admin role
  const adminClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: userData } = await adminClient
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") return null;
  return user;
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = statusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Estado inválido", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { status } = parsed.data;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: updatedUser, error: updateError } = await supabaseAdmin
    .from("users")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }

  // Send approval email
  if (status === "active" && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/portal/dashboard`;

    await resend.emails.send({
      from: "DZ Metals <noreply@dzmetals.cl>",
      to: updatedUser.email,
      subject: "Tu cuenta en DZ Metals ha sido aprobada",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C9A84C;">¡Bienvenido a DZ Metals!</h2>
          <p>Estimado/a ${updatedUser.full_name},</p>
          <p>Tu cuenta ha sido revisada y <strong>aprobada</strong> por nuestro equipo. Ya puedes acceder a tu portal personalizado.</p>
          <p>En el portal podrás:</p>
          <ul>
            <li>Ver el estado de tus operaciones</li>
            <li>Subir y gestionar documentos</li>
            <li>Comunicarte con nuestro equipo de brokers</li>
          </ul>
          <br/>
          <a href="${portalUrl}" style="background-color: #C9A84C; color: #0A0A0A; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Acceder al Portal
          </a>
          <br/><br/>
          <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
          <p>Equipo DZ Metals</p>
        </div>
      `,
    });
  }

  return NextResponse.json(updatedUser);
}
