import { sendRewardEmail } from "../src/utils/sendRewardEmail.js";

const ipCache = new Map();
const recentEmails = new Map();
const isProd = process.env.NODE_ENV === "production";

export default async function signalHandler(req, res) {


  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { email, message, fax, source, firstName } = req.body || {};

  // 🐜 Honeypot: bots will fill this hidden field
  if (fax && fax.trim() !== "") {
    console.warn("🤖 Bot trap triggered");
    return res.status(400).json({ message: "Bot detected." });
  }

  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  // 🔒 IP Rate Limit
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown-ip";

  // 🔒 IP Rate Limit (production only so dev isn't annoying
  if (isProd) {
    const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "unknown-ip";

    if (ipCache.has(ip)) {
      return res
        .status(429)
        .json({ message: "Too many signals from this IP. Try again later." });
    }

    ipCache.set(ip, true);
    // 10-minute window in prod (tune if you want)
    setTimeout(() => ipCache.delete(ip), 10 * 60 * 1000);
  }


  // 📨 Email Rate Limit
  if (recentEmails.has(email)) {
    return res
      .status(429)
      .json({ message: "You've already sent a signal recently." });
  }
  recentEmails.set(email, true);
  setTimeout(() => recentEmails.delete(email), 60 * 60 * 1000); // 1 hour

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = "e119572dab";
  const DISCORD_WEBHOOK_URL = process.env.DISCORD_SIGNAL_WEBHOOK;

  if (!API_KEY) {
    console.error("❌ Missing MAILCHIMP_API_KEY");
    return res.status(500).json({ message: "Server misconfigured (Mailchimp)" });
  }

  const DATACENTER = API_KEY.split("-")[1];
  if (!DATACENTER) {
    console.error("❌ Could not parse Mailchimp datacenter from API key");
    return res.status(500).json({ message: "Server misconfigured (Mailchimp DC)" });
  }

  const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

  const data = {
    email_address: email,
    status: "subscribed",
    merge_fields: {
      FNAME: firstName || "",
      MESSAGE: message || "–",
      SOURCE: source || "signal-form",
    },
  };

  try {
    // 1) Mailchimp subscribe
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `apikey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    const mailchimpOk =
      response.status === 200 ||
      response.status === 201 ||
      result.title === "Member Exists";

    if (!mailchimpOk) {
      console.error("Mailchimp error:", result);
      return res
        .status(400)
        .json({ message: "Subscription failed", error: result });
    }

    // 2) Discord notification (non-fatal if it fails)
    if (DISCORD_WEBHOOK_URL) {
      const discordContent = [
        "🔥 **New Signal Subscriber**",
        firstName ? `**Name:** ${firstName}` : null,
        `**Email:** ${email}`,
        source ? `**Source:** ${source}` : null,
        message ? `**Message:**\n${message}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      try {
        await fetch(DISCORD_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: discordContent }),
        });
        console.log(`✨ Discord notified for ${email}`);
      } catch (discordErr) {
        console.error("⚠️ Discord webhook error:", discordErr);
        // do NOT fail the whole request just because Discord choked
      }
    } else {
      console.warn("⚠️ DISCORD_SIGNAL_WEBHOOK not set; skipping Discord notify");
    }

    // 3) Optional email to you if they left a message
    if (message && message.trim().length > 0) {
      try {
        await sendRewardEmail({
          to: "graz@dgenr8.world",
          subject: `New signal from ${email}`,
          text: `Email: ${email}\n\nMessage:\n${message}`,
          html: `<p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong><br/>${message}</p>`,
        });
        console.log(`📩 Message email sent for ${email}`);
      } catch (err) {
        console.error("❌ Error sending message email:", err);
      }
    }

    // 🎯 Return "Already subscribed" if Mailchimp reports that
    if (result.title === "Member Exists") {
      return res.status(200).json({ message: "Already subscribed" });
    }

    // Otherwise normal success
    return res.status(200).json({ message: "Signal received." });
  } catch (err) {
    console.error("Mailchimp crash:", err);
    return res
      .status(500)
      .json({ message: "Internal error", error: err.message });
  }
}
