import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/* =========================
   SAFE SUPABASE INIT
========================= */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : null;

/* =========================
   CONFIG
========================= */
export const config = {
  api: {
    bodyParser: true, // IMPORTANT FIX (remove raw stream)
  },
};

/* =========================
   MAIN HANDLER
========================= */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(200).json({ ok: true });
  }

  try {
    if (!supabase) {
      return res.status(500).json({
        error: "Missing Supabase env vars",
      });
    }

    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return res.status(500).json({
        error: "Missing PAYSTACK_SECRET_KEY",
      });
    }

    const event = req.body;

    console.log("Webhook received:", event?.event);

    if (event?.event === "charge.success") {
      const email = event?.data?.customer?.email;
      const reference = event?.data?.reference || "";

      if (!email) {
        return res.status(400).json({ error: "Missing email" });
      }

      let plan = "FREE";

      if (reference.includes("elite")) plan = "ELITE";
      else if (reference.includes("pro-plus")) plan = "PRO_PLUS";
      else if (reference.includes("pro")) plan = "PRO";

      const { error } = await supabase
        .from("profiles")
        .update({
          plan,
          is_gold: plan !== "FREE",
          updated_at: new Date().toISOString(),
        })
        .eq("email", email);

      if (error) {
        console.error("Supabase error:", error);
        return res.status(500).json({
          error: "DB update failed",
          details: error.message,
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Webhook crash:", err);

    return res.status(500).json({
      error: "Webhook failed",
      details: err.message,
    });
  }
}
