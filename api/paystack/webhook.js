import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const config = {
  api: { bodyParser: false },
};

async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    const rawBody = await getRawBody(req);

    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const signature = req.headers["x-paystack-signature"];

    if (!signature || signature !== hash) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody);

    if (event.event !== "charge.success") {
      return res.status(200).json({ ignored: true });
    }

    const email = event.data.customer.email;
    const reference = event.data.reference;
    const amount = event.data.amount / 100;

    // prevent duplicate processing
    const { data: existing } = await supabase
      .from("transactions")
      .select("*")
      .eq("reference", reference)
      .maybeSingle();

    if (existing) {
      return res.status(200).json({ message: "Already processed" });
    }

    // PLAN LOGIC
    let plan = "FREE";
    if (reference.includes("elite")) plan = "ELITE";
    else if (reference.includes("pro-plus")) plan = "PRO_PLUS";
    else if (reference.includes("pro")) plan = "PRO";

    // get user
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("email", email)
      .single();

    if (!profile) {
      return res.status(404).json({ error: "User not found" });
    }

    // UPDATE PROFILE
    await supabase
      .from("profiles")
      .update({
        plan,
        plan_updated_at: new Date().toISOString(),
      })
      .eq("email", email);

    // INSERT TRANSACTION
    await supabase.from("transactions").insert({
      user_id: profile.id,
      email,
      reference,
      amount,
      plan,
      metadata: event.data,
    });

    // INSERT SUBSCRIPTION
    await supabase.from("subscriptions").insert({
      user_id: profile.id,
      email,
      plan,
      status: "active",
      reference,
      start_date: new Date(),
      end_date: null,
    });

    // AUDIT LOG
    await supabase.from("audit_logs").insert({
      user_id: profile.id,
      action: "PLAN_UPGRADED",
      entity: "profile",
      entity_id: profile.id,
      old_data: { plan: profile.plan },
      new_data: { plan },
      user_agent: req.headers["user-agent"] || null,
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message });
  }
}
