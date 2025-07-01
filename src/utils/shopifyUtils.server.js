// src/utils/shopifyUtils.server.js

import dotenv from "dotenv";
dotenv.config();

export async function generateNewCartId() {
  const result = await fetch(`https://${process.env.VITE_SHOPIFY_SHOP_NAME}.myshopify.com/api/2023-07/graphql.json`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": process.env.VITE_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    },
    body: JSON.stringify({
      query: `
        mutation {
          cartCreate {
            cart {
              id
            }
          }
        }
      `,
    }),
  });

  const json = await result.json();
  return json.data?.cartCreate?.cart?.id;
}
