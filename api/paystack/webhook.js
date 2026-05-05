import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { recordTransaction } from "../../src/lib/transactions";
import { writeLedger } from "../../src/lib/ledger";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = { api: { bodyParser: false } };

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString();
}

/**
 * Calculate subscription end date (1 month from now)
 */
function getSubscriptionEnd() {
  const date = new Date();
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const rawBody = await getRawBody(req);

    if (!secret) {
      console.error("[Webhook] PAYSTACK_SECRET_KEY not configured");
      return res.status(500).json({ error: "Server misconfigured" });
    }

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const signature = req.headers["x-paystack-signature"];

    if (signature !== hash) {
      console.warn("[Webhook] Invalid signature received");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const email = event.data.customer.email;
      const reference = event.data.reference;
      const amount = event.data.amount;

      console.log(`[Webhook] Processing charge.success for ${email}`);

      // 1. Determine plan from reference
      let plan = "FREE";
      if (reference.includes("elite")) plan = "ELITE";
      else if (reference.includes("pro-plus") || reference.includes("pro_plus")) plan = "PRO_PLUS";
      else if (reference.includes("pro")) plan = "PRO";

      // 2. Calculate subscription end date (1 month for monthly plans)
      const subscriptionEnd = getSubscriptionEnd();

      // 3. Get user profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      if (profileError) {
        console.error(`[Webhook] Profile fetch failed for ${email}:`, profileError.message);
        return res.status(500).json({
          error: "PROFILE_FETCH_FAILED",
          details: profileError.message,
        });
      }

      if (!profile) {
        console.error(`[Webhook] Profile not found for ${email}`);
        return res.status(404).json({
          error: "PROFILE_NOT_FOUND",
          email,
        });
      }

      // 4. Update user plan with subscription end date
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          plan: plan,
          subscription_end: subscriptionEnd,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (updateError) {
        console.error(`[Webhook] Profile update failed for ${email}:`, updateError.message);
        return res.status(500).json({
          error: "PROFILE_UPDATE_FAILED",
          details: updateError.message,
        });
      }

      // 5. RECORD TRANSACTION (non-blocking)
      try {
        await recordTransaction({
          user_id: profile?.id,
          email,
          reference,
          amount,
          plan,
        });
        console.log(`[Webhook] ✓ Transaction recorded for ${email}`);
      } catch (txnError) {
        console.error(`[Webhook] Transaction recording failed for ${email}:`, txnError.message);
        // Don't fail the webhook, but log it
      }

      // 6. LEDGER ENTRY (non-blocking)
      try {
        await writeLedger({
          user_id: profile?.id,
          type: "subscription_upgrade",
          amount,
          meta: { plan, reference, subscriptionEnd },
        });
        console.log(`[Webhook] ✓ Ledger entry created for ${email}`);
      } catch (ledgerError) {
        console.error(`[Webhook] Ledger write failed for ${email}:`, ledgerError.message);
        // Don't fail the webhook, but log it
      }

      console.log(`[Webhook] ✓ SUCCESS: ${email} upgraded to ${plan}, expires: ${subscriptionEnd}`);
    }

    return res.json({ success: true });
  } catch (err) {
    console.error("[Webhook] Fatal error:", err);
    return res.status(500).json({
      error: "WEBHOOK_FAILED",
      details: err.message,
      timestamp: new Date().toISOString(),
    });
  }
}
