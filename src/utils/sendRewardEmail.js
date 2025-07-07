// utils/sendRewardEmail.js

export async function sendRewardEmail({ to, subject, text, html }) {
  const API_KEY = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY_2;

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

  console.log("📤 Preparing to send custom Mailchimp transactional email...");
  console.log("➡️ Payload:", JSON.stringify(payload, null, 2));

  try {
    const response = await fetch("https://mandrillapp.com/api/1.0/messages/send.json", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log("📬 Mailchimp response:", data);

    if (Array.isArray(data) && data[0]?.status === "sent") {
      console.log(`✅ Email sent successfully to ${to}`);
    } else {
      console.error("❌ Mailchimp Transactional send failed:", data);
      throw new Error(data[0]?.reject_reason || "Unknown send failure");
    }
  } catch (err) {
    console.error("💥 Error while sending email:", err);
    throw err;
  }
}
