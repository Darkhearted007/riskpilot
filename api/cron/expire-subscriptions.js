import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  try {
    const now = new Date().toISOString();

    const { data: expired } = await supabase
      .from("subscriptions")
      .select("*")
      .lt("end_date", now)
      .eq("status", "active");

    for (const sub of expired || []) {
      await supabase
        .from("profiles")
        .update({ plan: "FREE" })
        .eq("user_id", sub.user_id);

      await supabase
        .from("subscriptions")
        .update({ status: "expired" })
        .eq("id", sub.id);

      await supabase.from("audit_logs").insert({
        user_id: sub.user_id,
        action: "SUBSCRIPTION_EXPIRED",
        entity: "subscription",
        entity_id: sub.id,
      });
    }

    return res.status(200).json({
      processed: expired?.length || 0,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
