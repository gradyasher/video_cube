// utils/sendRewardEmail.js
import nodemailer from "nodemailer";

export async function sendRewardEmail({ to, subject, text, html, rewardSlug = "general" }) {
  /*
  const testAccount = await nodemailer.createTestAccount();

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  const info = await transporter.sendMail({
    from: '"dgenr8. & soundbath." <rewards@dgenr8.world>',
    to,
    subject,
    text,
    html, // ✅ now html is actually defined and passed
  });

  console.log(`📨 Ethereal test email sent: ${nodemailer.getTestMessageUrl(info)}`);
  */
  const API_KEY = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY_2;

  const payload = {
    key: API_KEY,
    message: {
      from_email: "graz@dgenr8.world",
      from_name: "dgenr8. & soundbath.",
      to: [{ email: to, type: "to" }],
      subject,
      text,
      html,
      track_opens: true,
      track_clicks: true,
      auto_text: true,
      auto_html: true,
      tags: [rewardSlug],
    },
  };

  console.log("📤 Preparing to send Mailchimp transactional email...");
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
