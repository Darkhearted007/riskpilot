import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

/* =========================
   STRICT PRODUCTION GUARD
========================= */
if (!SUPABASE_URL || !SUPABASE_ANON) {
  throw new Error(
    "[RiskPilot FATAL] Missing Supabase env vars. " +
    "Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel."
  );
}

/* =========================
   SUPABASE CLIENT
========================= */
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
