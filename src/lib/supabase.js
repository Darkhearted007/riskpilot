import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://vvrmsgccngsdtjxtgwif.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2cm1zZ2NjbmdzZHRqeHRnd2lmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1NTU0NTgsImV4cCI6MjA5MjEzMTQ1OH0.uzg_4815t2zPZghLKG7GC15clVQcCkYYZ6a8AnzBUmQ'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
