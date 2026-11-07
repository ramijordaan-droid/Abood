// Add this script to your public page.
// Give the WhatsApp link this attribute:
// <a data-dynamic-whatsapp href="https://wa.me/9647000000000">تواصل عبر واتساب</a>

(async () => {
  try {
    const response = await fetch("/api/contact", { cache: "no-store" });
    if (!response.ok) return;
    const { whatsappNumber } = await response.json();
    if (!whatsappNumber) return;

    const digits = whatsappNumber.replace(/\D/g, "");
    document.querySelectorAll("[data-dynamic-whatsapp]").forEach((link) => {
      link.href = `https://wa.me/${digits}`;
    });
  } catch (error) {
    console.error("Could not load contact number", error);
  }
})();