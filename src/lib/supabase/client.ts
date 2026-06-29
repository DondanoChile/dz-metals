import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://pcfatvkupcrryqinvsox.supabase.co";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjZmF0dmt1cGNycnlxaW52c294Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI1NTU0NjAsImV4cCI6MjA5ODEzMTQ2MH0.39BlwOoBMSOaqYb4RMxEvr1valhW63SJLXDeOrsdYRA";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}
