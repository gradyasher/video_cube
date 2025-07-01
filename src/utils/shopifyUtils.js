import { shopifyFetch } from "../utils/shopifyClient";

export async function isVariantAvailable(variantId) {
  const query = `
    query getVariant($id: ID!) {
      node(id: $id) {
        ... on ProductVariant {
          id
          availableForSale
        }
      }
    }
  `;
  const variables = { id: variantId };
  const data = await shopifyFetch(query, variables);
  return data?.node?.availableForSale ?? false;
}

export async function getVariantDetails(variantId) {
  const query = `
    query GetVariant($id: ID!) {
      node(id: $id) {
        ... on ProductVariant {
          title
          price {
            amount
            currencyCode
          }
          product {
            title
          }
        }
      }
    }
  `;

  const data = await shopifyFetch(query, { id: variantId });
  return data?.node;
}
