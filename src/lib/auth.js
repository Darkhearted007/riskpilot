import { supabase } from "./supabase"

// SIGN UP
export const signUp = async (email, password) => {
  return await supabase.auth.signUp({
    email,
    password
  })
}

// SIGN IN
export const signIn = async (email, password) => {
  return await supabase.auth.signInWithPassword({
    email,
    password
  })
}

// SIGN OUT
export const signOut = async () => {
  return await supabase.auth.signOut()
}
