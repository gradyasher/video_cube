// src/api/subscribe.js
import crypto from "crypto";
import { sendRewardEmail } from "../src/utils/sendRewardEmail.js"
import { rewardMessages } from "../src/constants/rewardMap.js"


const rewardCache = new Map();

export default async function subscribeHandler(req, res) {
  // must be a post method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { email, reward, cartId, source } = req.body;

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
  const memberHash = crypto.createHash("md5").update(email.toLowerCase()).digest("hex");
  const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${memberHash}`;

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
    merge_fields: {
      SOURCE: source || "mystery-reward",
    },
  };

  try {
    // send to mailchimp
    const response = await fetch(url, {
      method: "PUT",
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

    if (!rewardMessages[reward]) {
      console.warn(`⚠️ isEmailReward true but no email content defined for: ${reward}`);
    }


    // success
    if (response.status === 200 || response.status === 201) {
      rewardCache.set(claimedKey, true); // ✅ success → mark as claimed
      res.setHeader(
        "Set-Cookie",
        `claimedMysteryReward=true; Path=/; Max-Age=${60 * 60 * 24}; HttpOnly`
      );

      const factories = rewardMessages[reward];
      if (factories) {
        // Choose which env to use; prefer a burn.link if you’re doing self-destruct
        const trackUrl =
          process.env.UNRELEASED_TRACK_BURNLINK ||
          process.env.UNRELEASED_TRACK_URL;

        const zineUrl = process.env.ZINE_URL;
        const streamLink = process.env.PRIVATE_STREAM_LINK;

        // Build the message using the appropriate param
        const rewardInfo =
          reward === "unreleased track"
            ? factories({ trackUrl })
            : reward === "glitch zine pdf"
            ? factories({ zineUrl })
            : reward === "private livestream access"
            ? factories({ streamLink })
            : factories({}); // default/no params

        await sendRewardEmail({
          to: email,
          subject: rewardInfo.subject,
          text: rewardInfo.text,
          html: rewardInfo.html,
          // optional: tags/metadata if you added them
          // tags: ["reward", "unreleased-track"],
          // metadata: { rewardSlug: reward.toLowerCase().replace(/\s+/g,'-') },
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
