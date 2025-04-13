// src/utils/shopifyClient.js
const SHOPIFY_DOMAIN = "nii0fj-0q.myshopify.com/"; // ← change this
const STOREFRONT_TOKEN = "3d2a490d6826cfbe3aba8e1cd27c720a"; // ← use your real token

const endpoint = `https://${SHOPIFY_DOMAIN}/api/2023-07/graphql.json`;

export async function shopifyFetch(query, variables = {}) {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    });

    const json = await res.json();

    if (json.errors) {
      console.error("❌ Shopify GraphQL error:", JSON.stringify(json.errors, null, 2));
      throw new Error(json.errors[0]?.message || "Shopify fetch failed");
    }

    return json.data;
  } catch (err) {
    console.error("❌ Network or parsing error:", err);
    throw err;
  }
}
