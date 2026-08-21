/**
 * Official Meta WhatsApp Cloud API & CallMeBot Gateway Integration
 */

export async function sendMetaWhatsAppMessage({
  phoneNumberId,
  accessToken,
  recipientPhone,
  message,
}: {
  phoneNumberId?: string;
  accessToken?: string;
  recipientPhone?: string;
  message: string;
}): Promise<{ success: boolean; error?: string }> {
  const phoneId = phoneNumberId || process.env.META_WHATSAPP_PHONE_NUMBER_ID;
  const token = accessToken || process.env.META_WHATSAPP_ACCESS_TOKEN;
  const recipient = recipientPhone || process.env.META_WHATSAPP_RECIPIENT_PHONE || process.env.WHATSAPP_PHONE_NUMBER;

  if (!phoneId || !token || !recipient) {
    return {
      success: false,
      error: 'Meta WhatsApp credentials (Phone Number ID, Access Token, or Recipient Phone) missing in .env',
    };
  }

  const cleanedPhone = recipient.replace(/[\s+]/g, '');
  const url = `https://graph.facebook.com/v19.0/${phoneId}/messages`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message,
        },
      }),
    });

    const data = await res.json();
    if (res.ok && !data.error) {
      return { success: true };
    }
    return { success: false, error: data.error?.message || 'Meta Cloud API Error' };
  } catch (err: any) {
    console.error('Meta WhatsApp Cloud API error:', err);
    return { success: false, error: err?.message || 'Network error calling Meta Cloud API' };
  }
}

export async function sendWhatsAppNotification({
  phone,
  apiKey,
  message,
  metaPhoneNumberId,
  metaAccessToken,
}: {
  phone?: string;
  apiKey?: string;
  message: string;
  metaPhoneNumberId?: string;
  metaAccessToken?: string;
}): Promise<{ success: boolean; error?: string }> {
  // Check if Meta Cloud API credentials are provided
  const hasMetaCreds =
    (metaPhoneNumberId && metaAccessToken) ||
    (process.env.META_WHATSAPP_PHONE_NUMBER_ID && process.env.META_WHATSAPP_ACCESS_TOKEN);

  if (hasMetaCreds) {
    return sendMetaWhatsAppMessage({
      phoneNumberId: metaPhoneNumberId,
      accessToken: metaAccessToken,
      recipientPhone: phone,
      message,
    });
  }

  // Fallback to CallMeBot API
  const targetPhone = phone || process.env.WHATSAPP_PHONE_NUMBER;
  const targetApiKey = apiKey || process.env.CALLMEBOT_API_KEY;

  if (!targetPhone || !targetApiKey) {
    return {
      success: false,
      error: 'WhatsApp configuration missing. Please provide Meta Cloud API credentials or CallMeBot API key in .env',
    };
  }

  const cleanedPhone = targetPhone.replace(/[\s+]/g, '');
  const encodedText = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${cleanedPhone}&text=${encodedText}&apikey=${targetApiKey}`;

  try {
    const res = await fetch(url, { method: 'GET' });
    if (res.ok) return { success: true };
    const text = await res.text();
    return { success: false, error: text || `HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err?.message || 'CallMeBot network error' };
  }
}
