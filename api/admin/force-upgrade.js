import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const adminKey = req.headers["x-admin-key"];

  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email, plan } = req.body;

  // Validate input
  if (!email || !plan) {
    return res.status(400).json({ error: "Missing email or plan" });
  }

  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .eq("email", email);

  if (error) return res.status(500).json(error);

  return res.status(200).json({ success: true, email, plan });
}
