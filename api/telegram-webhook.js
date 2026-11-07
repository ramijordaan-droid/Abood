import { createClient } from "@supabase/supabase-js";

const json = (res, status, body) => res.status(status).json(body);

async function sendTelegramMessage(token, chatId, text) {
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
  if (!response.ok) throw new Error("Telegram API request failed");
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  const {
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_WEBHOOK_SECRET,
    ADMIN_TELEGRAM_USER_ID,
    SUPABASE_URL,
    SUPABASE_SERVICE_ROLE_KEY
  } = process.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_WEBHOOK_SECRET ||
      !ADMIN_TELEGRAM_USER_ID || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return json(res, 500, { error: "Server configuration missing" });
  }

  const suppliedSecret = req.headers["x-telegram-bot-api-secret-token"];
  if (suppliedSecret !== TELEGRAM_WEBHOOK_SECRET) {
    return json(res, 401, { error: "Unauthorized webhook" });
  }

  try {
    const message = req.body?.message;
    const fromId = String(message?.from?.id ?? "");
    const chatId = message?.chat?.id;
    const text = String(message?.text ?? "").trim();

    if (!message || fromId !== String(ADMIN_TELEGRAM_USER_ID)) {
      return json(res, 200, { ok: true });
    }

    if (text === "/start" || text === "/settings") {
      const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { data, error } = await db
        .from("site_settings")
        .select("whatsapp_number")
        .eq("id", 1)
        .single();
      if (error) throw error;

      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `رقم واتساب التواصل الحالي:\n${data.whatsapp_number}\n\nلتغييره أرسل:\n/number +964XXXXXXXXXX`
      );
      return json(res, 200, { ok: true });
    }

    if (text.startsWith("/number ")) {
      const number = text.slice("/number ".length).trim();
      if (!/^\+[1-9]\d{7,14}$/.test(number)) {
        await sendTelegramMessage(
          TELEGRAM_BOT_TOKEN,
          chatId,
          "صيغة الرقم غير صحيحة. أرسله مع مفتاح الدولة، مثال:\n/number +9647XXXXXXXXX"
        );
        return json(res, 200, { ok: true });
      }

      const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
      const { error } = await db
        .from("site_settings")
        .update({ whatsapp_number: number, updated_at: new Date().toISOString() })
        .eq("id", 1);
      if (error) throw error;

      await sendTelegramMessage(
        TELEGRAM_BOT_TOKEN,
        chatId,
        `تم تحديث رقم واتساب التواصل إلى:\n${number}`
      );
      return json(res, 200, { ok: true });
    }

    await sendTelegramMessage(
      TELEGRAM_BOT_TOKEN,
      chatId,
      "الأوامر المتاحة:\n/settings لعرض الرقم الحالي\n/number +964XXXXXXXXXX لتغيير الرقم"
    );
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return json(res, 200, { ok: true });
  }
}