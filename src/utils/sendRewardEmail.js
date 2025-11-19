// utils/sendRewardEmail.js

export async function sendRewardEmail({ to, subject, text, html }) {
  const API_KEY = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY_2;

  if (!API_KEY) {
    const err = new Error("Missing MAILCHIMP_TRANSACTIONAL_API_KEY_2");
    console.error("❌", err.message);
    throw err;
  }
  if (!to || !subject || (!text && !html)) {
    const err = new Error("Missing required fields: to, subject, and text or html");
    console.error("❌", err.message);
    throw err;
  }

  const payload = {
    key: API_KEY,
    message: {
      to: [{ email: to, type: "to" }],
      from_email: "graz@dgenr8.world",
      from_name: "dgenr8. & soundbath.",
      subject,
      text,
      html,
      auto_text: true,
      track_opens: true,
      track_clicks: true,
      inline_css: true,
      important: true,
    },
  };

  // Log safely without leaking PII/HTML
  console.log("📤 Sending transactional email:", {
    to,
    subject,
    hasHtml: Boolean(html),
    hasText: Boolean(text),
  });

  try {
    const response = await fetch("https://mandrillapp.com/api/1.0/messages/send.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    // Mandrill success is an ARRAY; errors are often an OBJECT
    if (Array.isArray(data) && data[0]) {
      const status = data[0].status; // "sent" | "queued" | "rejected" | "invalid"
      if (status === "sent" || status === "queued") {
        console.log(`✅ Email ${status} to ${to}`);
        return data; // ← return provider response
      }
      console.error("❌ Mandrill send failed:", data);
      throw new Error(data[0]?.reject_reason || "Mandrill send failed");
    } else if (data && typeof data === "object") {
      // Typical error object shape
      console.error("❌ Mandrill error:", data);
      throw new Error(`${data.name || "MandrillError"}: ${data.message || "Unknown error"}`);
    } else {
      console.error("❌ Unexpected Mandrill response:", data);
      throw new Error("Unexpected Mandrill response");
    }
  } catch (err) {
    console.error("💥 Error while sending email:", err);
    throw err;
  }
}
