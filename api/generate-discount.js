// api/generate-discount.js

import express from "express";
const router = express.Router();

router.post("/", async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: "Email required" });

  const code = `DGEN-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const payload = {
    discount_code: {
      code,
    },
  };

  const response = await fetch(
    `https://${process.env.SHOPIFY_SHOP_NAME}.myshopify.com/admin/api/2023-04/price_rules/${process.env.SHOPIFY_PRICE_RULE_ID}/discount_codes.json`,
    {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("❌ Shopify error:", data);
    return res.status(500).json({ error: "Failed to create discount" });
  }

  // you could store { email, code } in a DB here

  return res.status(200).json({ code });
});

export default router;
