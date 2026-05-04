import { supabase } from "./supabaseClient";

export async function recordTransaction({
  user_id,
  email,
  reference,
  amount,
  plan,
}) {
  return await supabase.from("transactions").insert([
    {
      user_id,
      email,
      reference,
      amount,
      plan,
      status: "success",
      provider: "paystack",
    },
  ]);
}
