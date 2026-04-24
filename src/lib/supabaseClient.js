import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error(
    '[RiskPilot] Missing Supabase env vars. ' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Vercel/env configuration.'
  );
}

// Fallback to placeholder strings to prevent createClient from crashing the whole module import
const SAFE_URL  = SUPABASE_URL || 'https://placeholder-fix.supabase.co';
const SAFE_ANON = SUPABASE_ANON || 'placeholder-key';

export const supabase = createClient(SAFE_URL, SAFE_ANON, {
  auth: {
    persistSession:     true,
    autoRefreshToken:   true,
    detectSessionInUrl: true,
  },
});
