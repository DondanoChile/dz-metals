import type { SupabaseClient } from "@supabase/supabase-js";

export type UserRole = "buyer" | "seller" | "admin" | "superadmin";

/**
 * Extracts the user role from the Supabase JWT claims.
 * Checks app_metadata first (set server-side), then user_metadata (set by user).
 */
export async function getUserRole(
  supabase: SupabaseClient
): Promise<UserRole | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const role =
    user.app_metadata?.role ?? user.user_metadata?.role ?? null;

  return role as UserRole | null;
}

/**
 * Throws an error if the current session user does not have the admin role.
 * Use this in Server Actions or API routes that require admin access.
 */
export async function requireAdmin(supabase: SupabaseClient): Promise<void> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    throw new Error("Unauthorized: No active session");
  }

  const role = await getUserRole(supabase);

  if (role !== "admin" && role !== "superadmin") {
    throw new Error("Forbidden: Admin role required");
  }
}

/**
 * Throws an error if there is no active session.
 * Returns the current session if one exists.
 */
export async function requireAuth(supabase: SupabaseClient) {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    throw new Error(`Auth error: ${error.message}`);
  }

  if (!session) {
    throw new Error("Unauthorized: Authentication required");
  }

  return session;
}

/**
 * Returns the current user if authenticated, or null if not.
 * Does not throw — use this for conditional rendering logic.
 */
export async function getCurrentUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ?? null;
}
