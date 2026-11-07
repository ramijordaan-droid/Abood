# إدارة رقم واتساب من بوت تلغرام على Vercel

هذا المشروع مثال عام لتغيير **رقم التواصل فقط**. لا يرسل بيانات نماذج الزوار إلى تلغرام.

## 1) أنشئ قاعدة بيانات Supabase
1. أنشئ مشروعاً جديداً في Supabase.
2. افتح SQL Editor.
3. الصق محتوى `database.sql` ونفّذه.
4. من Project Settings > API انسخ Project URL و`service_role` key.

## 2) ارفع ملفات المشروع إلى GitHub
ارفع `package.json` ومجلد `api` إلى مستودع جديد. لا ترفع أي مفاتيح أو توكنات.

## 3) اربط المستودع مع Vercel
1. اختر Add New > Project في Vercel.
2. استورد مستودع GitHub.
3. أضف متغيرات البيئة التالية من Settings > Environment Variables:

- `SUPABASE_URL` = رابط مشروع Supabase
- `SUPABASE_SERVICE_ROLE_KEY` = مفتاح service_role
- `TELEGRAM_BOT_TOKEN` = توكن البوت الجديد من BotFather
- `TELEGRAM_WEBHOOK_SECRET` = كلمة سر عشوائية طويلة من أحرف وأرقام وشرطة سفلية وشرطة
- `ADMIN_TELEGRAM_USER_ID` = رقم حساب تلغرام الإداري (ليس رقم المجموعة)

4. أعد Deploy بعد إضافة المتغيرات.

## 4) عيّن Webhook للبوت
استبدل القيم في الأمر التالي ثم نفّذه من الطرفية على جهازك. لا تشارك الرابط الذي يحتوي على توكن البوت:

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -d "url=https://YOUR-VERCEL-DOMAIN/api/telegram-webhook" \
  -d "secret_token=YOUR_WEBHOOK_SECRET"
```

## 5) أوامر البوت
- `/settings` يعرض رقم التواصل الحالي.
- `/number +9647XXXXXXXXX` يغيّر الرقم بعد التحقق من هوية حساب تلغرام الإداري.

## 6) اربط زر واتساب في صفحتك
ضع `data-dynamic-whatsapp` على رابط واتساب الذي تريد تحديثه، ثم أضف محتوى `frontend-snippet.js` في الصفحة. غيّر الرقم الافتراضي داخل الرابط إلى رقمك الأول.

## ملاحظات أمنية
- لا تضع توكن البوت أو مفتاح Supabase السري في `index.html`.
- لا تستخدم رابط Webhook الذي يحتوي على التوكن في مكان عام.
- استخدم رقم حساب تلغرام الشخصي الصحيح في `ADMIN_TELEGRAM_USER_ID`.
- اختبر النظام برقم تواصل تملكه أو لديك تفويض لاستخدامه.
- تأكد أن الموقع يوضح بصدق الجهة المشغّلة وكيفية استخدام أي بيانات يرسلها الزائر.
