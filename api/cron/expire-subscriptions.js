import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Runs daily via Vercel Cron
 * Downgrades expired subscriptions
 */

export default async function handler(req, res) {
  try {
    const now = new Date().toISOString();

    // 1. Find expired paid users
    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("plan", "FREE")
      .lt("subscription_end", now);

    if (error) {
      return res.status(500).json({
        error: "FETCH_FAILED",
        details: error.message,
      });
    }

    let downgraded = 0;

    for (const user of users || []) {
      await supabase
        .from("profiles")
        .update({
          plan: "FREE",
          is_gold: false,
          updated_at: now,
        })
        .eq("id", user.id);

      downgraded++;
    }

    return res.json({
      success: true,
      downgraded,
    });
  } catch (err) {
    return res.status(500).json({
      error: "CRON_FAILED",
      details: err.message,
    });
  }
}
