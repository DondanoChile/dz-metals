import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { z } from "zod";
import { Resend } from "resend";

async function getAdminUser() {
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

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;

  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") return null;
  return user;
}

const requestSchema = z.object({
  user_id: z.string().uuid("ID de usuario inválido"),
  operation_id: z.string().uuid().optional(),
  doc_type: z.string().min(1, "Tipo de documento requerido"),
  message: z.string().min(1, "Mensaje requerido"),
});

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await request.json();
  const parsed = requestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  // Get user info for email
  const { data: userData } = await supabaseAdmin
    .from("users")
    .select("email, full_name")
    .eq("id", parsed.data.user_id)
    .single();

  // Insert document request
  const { data: docRequest, error } = await supabaseAdmin
    .from("document_requests")
    .insert({
      user_id: parsed.data.user_id,
      operation_id: parsed.data.operation_id ?? null,
      doc_type: parsed.data.doc_type,
      message: parsed.data.message,
      status: "pending",
      requested_by: admin.id,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Send email to user
  if (userData && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const portalUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/portal/documents`;

    await resend.emails.send({
      from: "DZ Metals <noreply@dzmetals.cl>",
      to: userData.email,
      subject: `DZ Metals solicita un documento: ${parsed.data.doc_type}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #C9A84C;">Solicitud de Documento</h2>
          <p>Estimado/a ${userData.full_name},</p>
          <p>El broker solicita el siguiente documento:</p>
          <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p><strong>Tipo de documento:</strong> ${parsed.data.doc_type}</p>
            <p><strong>Mensaje:</strong> ${parsed.data.message}</p>
          </div>
          <p>Por favor, sube el documento lo antes posible desde tu portal.</p>
          <br/>
          <a href="${portalUrl}" style="background-color: #C9A84C; color: #0A0A0A; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
            Subir Documento
          </a>
          <br/><br/>
          <p>Equipo DZ Metals</p>
        </div>
      `,
    });
  }

  return NextResponse.json({ success: true, request_id: docRequest.id }, { status: 201 });
}
