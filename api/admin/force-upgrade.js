export default async function handler(req, res) {
  const adminKey = req.headers["x-admin-key"];

  if (adminKey !== process.env.ADMIN_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { email, plan } = req.body;

  const { error } = await supabase
    .from("profiles")
    .update({ plan })
    .eq("email", email);

  if (error) return res.status(500).json(error);

  return res.status(200).json({ success: true });
}
