const WHATSAPP_NUMBER = "YOUR_WHATSAPP_NUMBER";

export const getWhatsAppSupportUrl = (
  message = "Hello TecoTask support, I need help with my account.",
) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;