export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "method not allowed" });
  }

  const { email } = req.body;
  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;

  if (!API_KEY || !AUDIENCE_ID) {
    return res.status(500).json({ error: "missing env vars" });
  }

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

    if (response.status >= 200 && response.status < 300) {
      return res.status(200).json({ message: "subscribed!" });
    } else {
      console.error("Mailchimp error:", result);
      return res.status(400).json({ message: "subscription failed", error: result });
    }
  } catch (err) {
    console.error("request error:", err);
    return res.status(500).json({ message: "server error", error: err.message });
  }
}
