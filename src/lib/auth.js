import { supabase } from "./supabase"

// SIGN UP (email + password)
export const signUp = async (email, password) => {
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: window.location.origin
    }
  })
}

// SIGN IN (email + password)
export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  })
}

// GOOGLE SIGN IN
export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.origin
    }
  })
}

// SIGN OUT
export const signOut = async () => {
  return await supabase.auth.signOut()
}
