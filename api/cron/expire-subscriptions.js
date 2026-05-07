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

    console.log("[Cron] expire-subscriptions started at", now);

    // 1. Find expired paid users
    const { data: users, error } = await supabase
      .from("profiles")
      .select("*")
      .neq("plan", "FREE")
      .lt("subscription_end", now);

    if (error) {
      console.error("[Cron] Failed to fetch expired users:", error);
      return res.status(500).json({
        error: "FETCH_FAILED",
        details: error.message,
      });
    }

    let downgraded = 0;
    const failed = [];

    console.log(`[Cron] Found ${users?.length || 0} expired subscriptions to process`);

    for (const user of users || []) {
      try {
        const { error: updateError } = await supabase
          .from("profiles")
          .update({
            plan: "FREE",
            is_gold: false,
            subscription_end: null,
            updated_at: now,
          })
          .eq("id", user.id);

        if (updateError) {
          console.error(`[Cron] Failed to downgrade user ${user.id}:`, updateError.message);
          failed.push({
            user_id: user.id,
            email: user.email,
            oldPlan: user.plan,
            error: updateError.message,
          });
        } else {
          console.log(`[Cron] ✓ Downgraded ${user.email} from ${user.plan} to FREE`);
          downgraded++;
        }
      } catch (userError) {
        console.error(`[Cron] Exception processing user ${user.id}:`, userError.message);
        failed.push({
          user_id: user.id,
          email: user.email,
          oldPlan: user.plan,
          error: userError.message,
        });
      }
    }

    const response = {
      success: true,
      timestamp: now,
      processed: users?.length || 0,
      downgraded,
      failed: failed.length,
    };

    if (failed.length > 0) {
      response.failedUsers = failed;
      console.warn(`[Cron] Completed with ${failed.length} failures`, failed);
    } else {
      console.log(`[Cron] ✓ Completed successfully. Downgraded ${downgraded} users`);
    }

    return res.json(response);
  } catch (err) {
    console.error("[Cron] Fatal error:", err);
    return res.status(500).json({
      error: "CRON_FAILED",
      details: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
