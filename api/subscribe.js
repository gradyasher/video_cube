// src/api/subscribe.js
import { sendRewardEmail } from "../src/utils/sendRewardEmail.js"
import { rewardMessages } from "../src/constants/rewardMap.js"


const rewardCache = new Map();

export default async function subscribeHandler(req, res) {
  // must be a post method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { email, reward, cartId } = req.body;

  const forceSend = process.env.FORCE_EMAIL_SEND === "true";

  // missing necessary data?
  if (!email || !reward || !cartId) {
    return res.status(400).json({ error: "Missing email, reward, or cartId" });
  }

  // 🛡️ Prevent multiple reward claims per cart
  const claimedKey = `claimedRewardForCart_${cartId}`;
  if (rewardCache.has(claimedKey)) {
    console.log(`⚠️ Reward already claimed for cart ${cartId}`);
    return res.status(200).json({ message: "Reward already granted" });
  }

  // 🧼 Skip burner domains (optional but wise)
  const bannedDomains = ["tempmail.com", "mailinator.com", "10minutemail.com"];
  const domain = email.split("@")[1];
  if (bannedDomains.includes(domain)) {
    return res.status(400).json({ message: "Temporary email domains are not allowed." });
  }


  // 🧪 MOCK Mailchimp in development
  if (process.env.NODE_ENV === "development" && !forceSend) {
    console.log(`[dev mode] Skipping Mailchimp – fake-subbed ${email} for ${reward}`);
    rewardCache.set(claimedKey, true); // ✅ prevent repeat claims
    res.setHeader(
      "Set-Cookie",
      `claimedMysteryReward=${encodeURIComponent(email)}; Path=/; Max-Age=31536000; HttpOnly`
    );
    return res.status(200).json({ message: "Mock subscription success", reward });
  }

  // 🧪 In dev mode, skip Mailchimp API call unless forced — but still send test email
  console.log("🧪 ENV:", {
    NODE_ENV: process.env.NODE_ENV,
    FORCE_EMAIL_SEND: process.env.FORCE_EMAIL_SEND,
  });

  if (process.env.NODE_ENV === "development" && !forceSend) {
    rewardCache.set(claimedKey, true);
    console.log('hit block');

    const rewardInfo = rewardMessages[reward];
    if (rewardInfo) {
      console.log(`[dev mode] Sending ETHEREAL test email for: ${reward}`);
      try {
        console.log("🧪 rewardInfo object at send time:", rewardInfo);

        const rewardSlug = reward.toLowerCase().replace(/\s+/g, '-');
        await sendRewardEmail({
          to: email,
          subject: rewardInfo.subject,
          text: rewardInfo.text,
          html: rewardInfo.html,
          rewardSlug
        });
      } catch (emailErr) {
        console.error("❌ Error sending reward email:", emailErr);
        return res.status(500).json({ message: "Email send failed", error: emailErr.message });
      }

    }

    res.setHeader(
      "Set-Cookie",
      `claimedMysteryReward=${encodeURIComponent(email)}; Path=/; Max-Age=31536000; HttpOnly`
    );

    return res.status(200).json({ message: "Test email sent (dev mode)", reward });
  }


  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = "e119572dab";
  const DATACENTER = API_KEY.split("-")[1];

  const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

  // 🛡️ Rate-limit via cookie
  const cookie = req.headers.cookie || "";
  const claimedCookie = cookie.split("; ").find((c) => c.startsWith("claimedMysteryReward="));

  if (claimedCookie) {
    const claimedEmail = decodeURIComponent(claimedCookie.split("=")[1]);
    if (email === claimedEmail) {
      return res.status(429).json({ message: "You've already claimed this reward." });
    }
  }

  const data = {
    email_address: email,
    status: "subscribed",
  };

  try {
    // send to mailchimp
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `apikey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    // already subbed?
    if (result.title === "Member Exists") {
      console.log("👻 Already subscribed:", email);
      rewardCache.set(claimedKey, true); // ✅ still mark reward as claimed
      return res.status(200).json({
        message: "Already subscribed",
        alreadyClaimed: true,
        setCookie: true,
      });
    }

    if (!rewardMessages[reward] && rewardMap[reward]?.isEmailReward) {
      console.warn(`⚠️ isEmailReward true but no email content defined for: ${reward}`);
    }


    // success
    if (response.status === 200 || response.status === 201) {
      rewardCache.set(claimedKey, true); // ✅ success → mark as claimed
      res.setHeader(
        "Set-Cookie",
        `claimedMysteryReward=true; Path=/; Max-Age=${60 * 60 * 24}; HttpOnly`
      );

      const rewardInfo = rewardMessages[reward];
      if (rewardInfo) {
        console.log(`📤 Sending reward email for: ${reward}`);

        // 🔁 Swap this for actual email provider logic (Resend, Postmark, etc.)
        const rewardSlug = reward.toLowerCase().replace(/\s+/g, '-');
        await sendRewardEmail({
          to: email,
          subject: rewardInfo.subject,
          text: rewardInfo.text,
          html: rewardInfo.html,
          rewardSlug
        });
      }
      return res.status(200).json({ message: "Subscribed successfully!" });
    } else {
      console.error("Mailchimp error:", result);
      return res.status(400).json({ message: "Subscription failed", error: result });
    }
  } catch (err) {
    console.error("Mailchimp crash:", err);
    return res.status(500).json({ message: "Internal error", error: err.message });
  }
}
