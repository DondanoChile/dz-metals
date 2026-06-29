import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { generateDocumentPDF } from "@/lib/pdf/generateDocument";

export async function POST(req: NextRequest) {
  try {
    // Verify admin session
    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTU0NjAsImV4cCI6MjA5ODEzMTQ2MH0.39BlwOoBMSOaqYb4RMxEvr1valhW63SJLXDeOrsdYRA",
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user }, error: authError } = await authClient.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjU1NTQ2MCwiZXhwIjoyMDk4MTMxNDYwfQ.Goqtvwcle8pGKasYeJzEHKC2sJBinHriVvM8akUCyNA"
    );

    // Verify admin role
    const { data: adminUser } = await adminClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (adminUser?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const {
      templateCode,
      userId,
      signatoryId,
      language,
      clientType,
      fieldValues,
      includeExclusivity,
      hasTraceability,
    } = body;

    if (!templateCode || !userId || !signatoryId || !language) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Fetch template
    const { data: template, error: templateError } = await adminClient
      .from("document_templates")
      .select("*")
      .eq("code", templateCode)
      .eq("is_active", true)
      .single();

    if (templateError || !template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    // Fetch user
    const { data: targetUser, error: userError } = await adminClient
      .from("users")
      .select("id, full_name, email")
      .eq("id", userId)
      .single();

    if (userError || !targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch signatory
    const { data: signatory, error: signatoryError } = await adminClient
      .from("signatories")
      .select("*")
      .eq("id", signatoryId)
      .single();

    if (signatoryError || !signatory) {
      return NextResponse.json({ error: "Signatory not found" }, { status: 404 });
    }

    // Resolve signatory signature URL if stored as path
    if (signatory.signature_url && !signatory.signature_url.startsWith("http")) {
      const { data: signed } = await adminClient.storage
        .from("signatures")
        .createSignedUrl(signatory.signature_url, 300);
      if (signed?.signedUrl) signatory.signature_url = signed.signedUrl;
    }

    // Generate a document ID first (we'll use it for the filename and PDF footer)
    const documentId = crypto.randomUUID();

    // Parse template fields if they come as string
    const parsedTemplate = {
      ...template,
      fields: Array.isArray(template.fields) ? template.fields : JSON.parse(template.fields ?? "[]"),
    };

    // Generate PDF
    const pdfBuffer = await generateDocumentPDF(
      parsedTemplate,
      fieldValues ?? {},
      signatory,
      {
        language: language as "es" | "en" | "both",
        clientType: clientType ?? "natural",
        includeExclusivity: includeExclusivity ?? false,
        hasTraceability: hasTraceability ?? false,
        documentId,
      }
    );

    // Upload to storage
    const timestamp = Date.now();
    const storagePath = `${userId}/${templateCode}-${timestamp}.pdf`;

    const { error: uploadError } = await adminClient.storage
      .from("generated-docs")
      .upload(storagePath, pdfBuffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      console.error("Storage upload error:", uploadError);
      return NextResponse.json({ error: "Failed to upload PDF" }, { status: 500 });
    }

    // Insert into generated_documents
    const { error: insertError } = await adminClient
      .from("generated_documents")
      .insert({
        id: documentId,
        template_id: template.id,
        user_id: userId,
        signatory_id: signatoryId,
        language,
        client_type: clientType ?? "natural",
        field_values: fieldValues ?? {},
        include_exclusivity: includeExclusivity ?? false,
        has_traceability: hasTraceability ?? false,
        status: "sent",
        storage_path: storagePath,
        sent_at: new Date().toISOString(),
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json({ error: "Failed to save document record" }, { status: 500 });
    }

    return NextResponse.json({ success: true, documentId });
  } catch (err) {
    console.error("Send document error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
