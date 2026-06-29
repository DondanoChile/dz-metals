import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Resend } from "resend";

const buyerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Contraseña debe tener al menos 8 caracteres"),
  full_name: z.string().min(2, "Nombre requerido"),
  phone: z.string().min(6, "Teléfono requerido"),
  country: z.string().min(2, "País requerido"),
  metals_interested: z.array(z.string()).min(1, "Seleccione al menos un metal"),
  min_purity: z.number().min(0).max(100).optional(),
  quantity_needed_kg: z.number().positive("Cantidad debe ser positiva").optional(),
  destination_country: z.string().optional(),
  payment_method: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = buyerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Datos inválidos", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // 1. Create Supabase Auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });

    if (authError) {
      const msg = authError.message.toLowerCase();
      if (msg.includes("already") || msg.includes("registered") || authError.status === 422) {
        return NextResponse.json({ error: "Este email ya está registrado" }, { status: 409 });
      }
      throw authError;
    }

    const userId = authData.user.id;

    // 2. Insert into public.users
    const { error: userError } = await supabaseAdmin.from("users").insert({
      id: userId,
      email: data.email,
      full_name: data.full_name,
      phone: data.phone,
      country: data.country,
      role: "buyer",
      status: "pending",
    });

    if (userError) throw userError;

    // 3. Insert into public.buyer_profiles
    const { error: profileError } = await supabaseAdmin.from("buyer_profiles").insert({
      user_id: userId,
      metals_interested: data.metals_interested,
      min_purity: data.min_purity ?? null,
      quantity_needed_kg: data.quantity_needed_kg ?? null,
      destination_country: data.destination_country ?? null,
      payment_method: data.payment_method ?? null,
      notes: data.notes ?? null,
    });

    if (profileError) throw profileError;

    // 4. Send email to broker via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "DZ Metals <noreply@dzmetals.cl>",
        to: process.env.BROKER_EMAIL || "broker@dzmetals.cl",
        subject: `Nuevo comprador registrado: ${data.full_name}`,
        html: `
          <h2>Nuevo comprador registrado</h2>
          <p><strong>Nombre:</strong> ${data.full_name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Teléfono:</strong> ${data.phone}</p>
          <p><strong>País:</strong> ${data.country}</p>
          <p><strong>Metales de interés:</strong> ${data.metals_interested.join(", ")}</p>
          <p><strong>Cantidad necesaria:</strong> ${data.quantity_needed_kg ?? "No especificada"} kg</p>
          <p><strong>País destino:</strong> ${data.destination_country ?? "No especificado"}</p>
          <p><strong>Método de pago:</strong> ${data.payment_method ?? "No especificado"}</p>
          <p><strong>Notas:</strong> ${data.notes ?? "Sin notas"}</p>
          <br/>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/buyers">Ver en panel de administración</a>
        `,
      });
    }

    // 5. Send WhatsApp via Twilio (optional)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = (await import("twilio")).default;
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `🔔 Nuevo comprador registrado en DZ Metals:\n\nNombre: ${data.full_name}\nEmail: ${data.email}\nTeléfono: ${data.phone}\nMetales: ${data.metals_interested.join(", ")}\n\nRevisa el panel de admin.`,
          from: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
          to: process.env.BROKER_WHATSAPP || "whatsapp:+56912345678",
        });
      } catch (twilioErr) {
        console.error("Twilio error (non-fatal):", twilioErr);
      }
    }

    return NextResponse.json({ success: true, userId, message: "Registro recibido" }, { status: 201 });
  } catch (error) {
    console.error("Buyer registration error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
