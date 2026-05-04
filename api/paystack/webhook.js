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

    if (signature !== hash) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = JSON.parse(rawBody);

    if (event.event === "charge.success") {
      const email = event.data.customer.email;
      const reference = event.data.reference;
      const amount = event.data.amount;

      // 1. Determine plan
      let plan = "FREE";
      if (reference.includes("elite")) plan = "ELITE";
      else if (reference.includes("pro-plus")) plan = "PRO_PLUS";
      else if (reference.includes("pro")) plan = "PRO";

      // 2. Get user
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("email", email)
        .single();

      // 3. Update user plan
      await supabase
        .from("profiles")
        .update({
          plan,
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      // 4. TRANSACTION LOG
      await recordTransaction({
        user_id: profile?.id,
        email,
        reference,
        amount,
        plan,
      });

      // 5. LEDGER ENTRY
      await writeLedger({
        user_id: profile?.id,
        type: "upgrade",
        amount,
        meta: { plan, reference },
      });
    }

    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({
      error: "WEBHOOK_FAILED",
      details: err.message,
    });
  }
}
