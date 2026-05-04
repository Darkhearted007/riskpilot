import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/* =========================
   SUPABASE CLIENT (SERVER)
========================= */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/* =========================
   DISABLE VERCEL BODY PARSER
========================= */
export const config = {
  api: {
    bodyParser: false,
  },
};

/* =========================
   READ RAW REQUEST BODY
========================= */
async function getRawBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/* =========================
   MAIN WEBHOOK HANDLER
========================= */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({ error: "Missing PAYSTACK_SECRET_KEY" });
    }

    // 1. GET RAW BODY
    const rawBody = await getRawBody(req);

    // 2. VERIFY SIGNATURE
    const hash = crypto
      .createHmac("sha512", secret)
      .update(rawBody)
      .digest("hex");

    const signature = req.headers["x-paystack-signature"];

    if (!signature || signature !== hash) {
      return res.status(401).json({ error: "Invalid signature" });
    }

    // 3. PARSE EVENT
    const event = JSON.parse(rawBody);

    console.log("Paystack event:", event.event);

    // 4. HANDLE SUCCESS PAYMENT
    if (event.event === "charge.success") {
      const email = event.data.customer.email;
      const metadata = event.data.metadata || {};
      const reference = event.data.reference || "";

      // 5. DETERMINE PLAN
      let plan = "free";

      if (reference.includes("riskpilot-elite")) plan = "elite";
      else if (reference.includes("riskpilot-pro-plus")) plan = "pro_plus";
      else if (reference.includes("riskpilot-pro")) plan = "pro";

      console.log("Upgrading user:", email, "Plan:", plan);

      // 6. UPDATE SUPABASE
      const { error } = await supabase
        .from("profiles")
        .update({
          plan,
          is_gold: plan !== "free",
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (error) {
        console.error("Supabase update error:", error);
        return res.status(500).json({
          error: "Failed to update user",
          details: error.message,
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);

    return res.status(500).json({
      error: "Webhook failed",
      details: error.message,
    });
  }
}
