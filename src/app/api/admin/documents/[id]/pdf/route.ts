import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Read session
    const cookieStore = await cookies();
    const authClient = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get the document record
    const { data: doc, error: docError } = await adminClient
      .from("generated_documents")
      .select("id, user_id, storage_path, status, viewed_at")
      .eq("id", id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Verify access: admin or document owner
    const { data: requestingUser } = await adminClient
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    const isAdmin = requestingUser?.role === "admin";
    const isOwner = doc.user_id === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!doc.storage_path) {
      return NextResponse.json({ error: "No PDF available" }, { status: 404 });
    }

    // Mark as viewed if it's the owner viewing for the first time
    if (isOwner && !doc.viewed_at) {
      await adminClient
        .from("generated_documents")
        .update({ status: "viewed", viewed_at: new Date().toISOString() })
        .eq("id", id);
    }

    // Create signed URL (1 hour)
    const { data: signedData, error: signError } = await adminClient.storage
      .from("generated-docs")
      .createSignedUrl(doc.storage_path, 3600);

    if (signError || !signedData?.signedUrl) {
      return NextResponse.json({ error: "Could not generate signed URL" }, { status: 500 });
    }

    return NextResponse.redirect(signedData.signedUrl);
  } catch (err) {
    console.error("PDF route error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
