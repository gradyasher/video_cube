// /api/subscribe.js
import express from "express";
import axios from "axios";
const router = express.Router();

const MAILCHIMP_API_KEY = import.meta.env.VITE_MAILCHIMP_API_KEY;
const MAILCHIMP_SERVER_PREFIX = "us12"; // from your Mailchimp URL
const AUDIENCE_ID = "e119572dab";

export default async function handler(req, res) {
  const { email } = req.body;

  const API_KEY = process.env.VITE_MAILCHIMP_API_KEY;
  const AUDIENCE_ID = "e119572dab"; // your audience ID
  const DATACENTER = API_KEY.split("-")[1]; // Extract "us12" from "abc-us12"

  const url = `https://${DATACENTER}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`;

  const data = {
    email_address: email,
    status: "subscribed",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `apikey ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (response.status === 200 || response.status === 201) {
    return res.status(200).json({ message: "Subscribed successfully!" });
  } else {
    console.error("Mailchimp error:", result);
    return res.status(400).json({ message: "Subscription failed.", error: result });
  }
}


router.post("/subscribe", async (req, res) => {
  console.log("🔐 MAILCHIMP_API_KEY:", MAILCHIMP_API_KEY);
  const { email } = req.body;
  try {
    const response = await axios.post(
      `https://${MAILCHIMP_SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`,
      {
        email_address: email,
        status: "subscribed"
      },
      {
        headers: {
          Authorization: `apikey ${MAILCHIMP_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.status(200).json({ success: true });
  } catch (err) {
    console.error("Mailchimp error:", err.response?.data || err.message);
    res.status(400).json({ success: false, message: err.message });
  }
});

export default router;
