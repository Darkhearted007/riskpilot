import { supabase } from "./supabaseClient";

/**
 * Writes immutable financial event
 */
export async function writeLedger({
  user_id,
  type,
  amount = 0,
  balance_before = 0,
  balance_after = 0,
  meta = {},
}) {
  return await supabase.from("ledger").insert([
    {
      user_id,
      type,
      amount,
      balance_before,
      balance_after,
      meta,
    },
  ]);
}
