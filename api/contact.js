import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ error: "Server configuration missing" });
  }

  try {
    const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data, error } = await db
      .from("site_settings")
      .select("whatsapp_number")
      .eq("id", 1)
      .single();

    if (error) throw error;
    return res.status(200).json({ whatsappNumber: data.whatsapp_number });
  } catch {
    return res.status(500).json({ error: "Could not load contact setting" });
  }
}