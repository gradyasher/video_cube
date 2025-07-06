// utils/sendRewardEmail.js
export async function sendRewardEmail({ to, subject, text, html, rewardSlug = "general" }) {
  const API_KEY = process.env.MAILCHIMP_TRANSACTIONAL_API_KEY_2;


  const payload = {
    key: API_KEY,
    template_name: "unreleased-track-reward-2",
    template_content: [
      {
        name: "main_content",
        content: "<p style='color: red;'>🔥 THIS IS A TEST 🔥</p>",
      }
    ],
    message: {
      to: [{ email: to, type: "to" }],
      from_email: "graz@dgenr8.world",
      from_name: "dgenr8. & soundbath.",
      subject,
      merge_vars: [
        {
          rcpt: to,
          vars: [
            { name: "email", content: to },
            { name: "reward_slug", content: rewardSlug },
          ],
        },
      ],
      global_merge_vars: [
        { "name": "email", "content": to },
        { "name": "reward_slug", "content": "unreleased-track" }
      ]

    },
  };

  /*
  const payload = {
    key: API_KEY,
    template_name: "test-mc-edit",
    template_content: [
      {
        name: "main_content",
        content: "<h1 style='color: #00cfff;'>it worked 🌀</h1><p>This is a test injection with styling</p>"
      }
    ],
    message: {
      subject: "🧪 Visual Test Injection",
      from_email: "graz@dgenr8.world",
      from_name: "soundbath.",
      to: [
        {
          email: to,
          type: "to"
        }
      ],
      important: true,
      track_opens: true,
      track_clicks: true,
      auto_text: true,
      inline_css: true
    }
  };*/

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
