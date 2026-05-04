import { supabase } from "./supabaseClient";

export async function requirePlan(email, allowedPlans = []) {
  const { data } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("email", email)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return false;

  const expired =
    data.expires_at && new Date(data.expires_at) < new Date();

  if (expired) return false;

  if (allowedPlans.length === 0) return true;

  return allowedPlans.includes(data.plan.toLowerCase());
}
