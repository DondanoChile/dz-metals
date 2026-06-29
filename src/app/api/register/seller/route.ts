import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { Resend } from "resend";

const sellerSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Contraseña debe tener al menos 8 caracteres"),
  full_name: z.string().min(2, "Nombre requerido"),
  phone: z.string().min(6, "Teléfono requerido"),
  country: z.string().min(2, "País requerido"),
  metal_type: z.enum(["oro", "cobre", "plata", "molibdeno", "sal", "otro"]),
  metal_state: z.enum(["colpa", "concentrado", "refinado", "dore", "otro"]),
  purity: z.number().min(0).max(100).optional(),
  humidity: z.number().min(0).max(100).optional(),
  quantity_kg: z.number().positive("Cantidad debe ser positiva"),
  origin_country: z.string().min(2, "País de origen requerido"),
  origin_region: z.string().min(2, "Región de origen requerida"),
  traceability: z.enum(["completa", "incompleta", "no_tengo"]),
  has_analysis: z.boolean().default(false),
  analysis_lab: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sellerSchema.safeParse(body);

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
      role: "seller",
      status: "pending",
    });

    if (userError) throw userError;

    // 3. Insert into public.seller_profiles
    const { error: profileError } = await supabaseAdmin.from("seller_profiles").insert({
      user_id: userId,
      metal_type: data.metal_type,
      metal_state: data.metal_state,
      purity: data.purity ?? null,
      humidity: data.humidity ?? null,
      quantity_kg: data.quantity_kg,
      origin_country: data.origin_country,
      origin_region: data.origin_region,
      traceability: data.traceability,
      has_analysis: data.has_analysis,
      analysis_lab: data.analysis_lab ?? null,
      notes: data.notes ?? null,
    });

    if (profileError) throw profileError;

    // 4. Send email to broker via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "DZ Metals <noreply@dzmetals.cl>",
        to: process.env.BROKER_EMAIL || "broker@dzmetals.cl",
        subject: `Nuevo vendedor registrado: ${data.full_name}`,
        html: `
          <h2>Nuevo vendedor registrado</h2>
          <p><strong>Nombre:</strong> ${data.full_name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Teléfono:</strong> ${data.phone}</p>
          <p><strong>País:</strong> ${data.country}</p>
          <p><strong>Metal:</strong> ${data.metal_type}</p>
          <p><strong>Estado del metal:</strong> ${data.metal_state}</p>
          <p><strong>Pureza:</strong> ${data.purity ?? "No especificada"}%</p>
          <p><strong>Humedad:</strong> ${data.humidity ?? "No especificada"}%</p>
          <p><strong>Cantidad:</strong> ${data.quantity_kg} kg</p>
          <p><strong>Origen:</strong> ${data.origin_region}, ${data.origin_country}</p>
          <p><strong>Trazabilidad:</strong> ${{ completa: "Completa", incompleta: "Incompleta", no_tengo: "No tiene" }[data.traceability]}</p>
          <p><strong>Tiene análisis:</strong> ${data.has_analysis ? "Sí" : "No"}</p>
          ${data.has_analysis ? `<p><strong>Laboratorio:</strong> ${data.analysis_lab}</p>` : ""}
          <p><strong>Notas:</strong> ${data.notes ?? "Sin notas"}</p>
          <br/>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/sellers">Ver en panel de administración</a>
        `,
      });
    }

    // 5. Send WhatsApp via Twilio (optional)
    if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      try {
        const twilio = (await import("twilio")).default;
        const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
          body: `🔔 Nuevo vendedor registrado en DZ Metals:\n\nNombre: ${data.full_name}\nEmail: ${data.email}\nMetal: ${data.metal_type} (${data.metal_state})\nCantidad: ${data.quantity_kg} kg\nOrigen: ${data.origin_region}, ${data.origin_country}\n\nRevisa el panel de admin.`,
          from: process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886",
          to: process.env.BROKER_WHATSAPP || "whatsapp:+56912345678",
        });
      } catch (twilioErr) {
        console.error("Twilio error (non-fatal):", twilioErr);
      }
    }

    return NextResponse.json({ success: true, userId, message: "Registro recibido" }, { status: 201 });
  } catch (error) {
    console.error("Seller registration error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
