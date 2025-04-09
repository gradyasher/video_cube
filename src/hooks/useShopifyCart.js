// src/hooks/useShopifyCart.js
import { useEffect, useState } from "react";
import { shopifyFetch } from "../utils/shopifyClient";
// src/hooks/useShopifyCart.js

async function addItem(variantId, quantity = 1) {
  const query = `
    mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;

  const variables = {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  };

  const data = await shopifyFetch(query, variables);
  return data.cartLinesAdd.cart.checkoutUrl;
}

export default function useShopifyCart() {
  const [cartId, setCartId] = useState(null);
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const savedCartId = localStorage.getItem("shopify_cart_id");
    if (savedCartId) {
      setCartId(savedCartId);
      fetchCart(savedCartId);
    } else {
      createCart();
    }
  }, []);

  async function createCart() {
    const query = `
      mutation {
        cartCreate {
          cart {
            id
            checkoutUrl
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      title
                      product {
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const data = await shopifyFetch(query);
    const id = data.cartCreate.cart.id;
    localStorage.setItem("shopify_cart_id", id);
    setCartId(id);
    setCart(data.cartCreate.cart); // 🆕
  }

  async function fetchCart(id = cartId) {
    const query = `
      query getCart($id: ID!) {
        cart(id: $id) {
          id
          checkoutUrl
          lines(first: 10) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    title
                    product {
                      title
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;
    const data = await shopifyFetch(query, { id });
    setCart(data.cart);
    return data.cart;
  }

  async function removeItem(lineId) {
    const query = `
      mutation removeLine($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            lines(first: 10) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      title
                      product {
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const variables = { cartId, lineIds: [lineId] };
    const data = await shopifyFetch(query, variables);
    setCart(data.cartLinesRemove.cart);
  }

  return {
    cartId,
    cart,
    addItem,
    removeItem,
    fetchCart,
  };
}
