export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { email, reward } = req.body;

  // 🧼 Skip burner domains (optional but wise)
  const bannedDomains = ["tempmail.com", "mailinator.com", "10minutemail.com"];
  const domain = email.split("@")[1];
  if (bannedDomains.includes(domain)) {
    return res.status(400).json({ message: "Temporary email domains are not allowed." });
  }

  // 🧪 MOCK Mailchimp in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[dev mode] Skipping Mailchimp – fake-subbed ${email} for ${reward}`);
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

  // if cookie exists, AND the incoming email matches, then block
  if (claimedCookie) {
    const body = req.body; // or however you parse the request
    const claimedEmail = decodeURIComponent(claimedCookie.split("=")[1]);

    if (body.email === claimedEmail) {
      return res.status(429).json({ message: "You've already claimed this reward." });
    }
  }


  // 🛡️ Optional: block by IP (can be spoofed, but still useful for soft rate-limiting)
  // const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  // if (hasClaimedRecently(ip)) return res.status(429).json({ message: "Too many claims from this IP." });

  const data = {
    email_address: email,
    status: "subscribed",
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

    // ✅ Gracefully handle "already subscribed"
    if (result.title === "Member Exists") {
      console.log("👻 Already subscribed:", email);
      return res.status(200).json({
        message: "Already subscribed",
        alreadyClaimed: true,
        setCookie: true,
      });
    }

    if (response.status === 200 || response.status === 201) {
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
