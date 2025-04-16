export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { email } = req.body;
  const API_KEY = process.env.VITE_MAILCHIMP_API_KEY;
  const AUDIENCE_ID = "e119572dab";
  const DATACENTER = API_KEY.split("-")[1];

  const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

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

    // ✅ Handle "already subscribed" gracefully
    if (result.title === "Member Exists") {
      console.log("👻 Already subscribed:", email);
      return res.status(200).json({ message: "Already subscribed" });
    }

    if (response.status === 200 || response.status === 201) {
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
