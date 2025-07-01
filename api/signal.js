import { sendRewardEmail } from "../src/utils/sendRewardEmail.js";

const ipCache = new Map();
const recentEmails = new Map();

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { email, message, fax } = req.body;

  // 🐜 Honeypot: bots will fill this hidden field
  if (fax && fax.trim() !== "") {
    console.warn("🤖 Bot trap triggered");
    return res.status(400).json({ message: "Bot detected." });
  }

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  // 🔒 IP Rate Limit
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  if (ipCache.has(ip)) {
    return res.status(429).json({ message: "Too many signals from this IP. Try again later." });
  }
  ipCache.set(ip, true);
  setTimeout(() => ipCache.delete(ip), 60 * 60 * 1000); // 1 hour

  // 📨 Email Rate Limit
  if (recentEmails.has(email)) {
    return res.status(429).json({ message: "You've already sent a signal recently." });
  }
  recentEmails.set(email, true);
  setTimeout(() => recentEmails.delete(email), 60 * 60 * 1000); // 1 hour

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = "e119572dab";
  const DATACENTER = API_KEY.split("-")[1];

  const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

  const data = {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      MESSAGE: message || "–",
      SOURCE: "signal-form",
    },
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `apikey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (response.status === 200 || response.status === 201 || result.title === "Member Exists") {
      // ✅ fallback email if message field is not saved
      if (message && message.trim().length > 0) {
        try {
          await sendRewardEmail({
            to: "graz@dgenr8.world",
            subject: `New signal from ${email}`,
            text: `Email: ${email}\n\nMessage:\n${message}`,
            html: `<p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${message}</p>`,
          });
          console.log(`📩 Message fallback sent for ${email}`);
        } catch (err) {
          console.error("❌ Error sending fallback message email:", err);
        }
      }

      return res.status(200).json({ message: "Signal received." });
    } else {
      console.error("Mailchimp error:", result);
      return res.status(400).json({ message: "Subscription failed", error: result });
    }
  } catch (err) {
    console.error("Mailchimp crash:", err);
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
}
