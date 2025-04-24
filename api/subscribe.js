// src/api/subscribe.js

const rewardCache = new Map();

export default async function handler(req, res) {
  // must be a post method
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { email, reward, cartId } = req.body;

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
  if (process.env.NODE_ENV === "development") {
    console.log(`[dev mode] Skipping Mailchimp – fake-subbed ${email} for ${reward}`);
    rewardCache.set(claimedKey, true); // ✅ prevent repeat claims
    res.setHeader(
      "Set-Cookie",
      `claimedMysteryReward=${encodeURIComponent(email)}; Path=/; Max-Age=31536000; HttpOnly`
    );
    return res.status(200).json({ message: "Mock subscription success", reward });
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

    // success
    if (response.status === 200 || response.status === 201) {
      rewardCache.set(claimedKey, true); // ✅ success → mark as claimed
      res.setHeader(
        "Set-Cookie",
        `claimedMysteryReward=true; Path=/; Max-Age=${60 * 60 * 24}; HttpOnly`
      );
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
