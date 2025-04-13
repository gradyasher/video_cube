// src/hooks/useShopifyCart.jsx
import { useEffect, useState } from "react";
import { shopifyFetch } from "../utils/shopifyClient";

export default function useShopifyCart() {
  const [cartId, setCartId] = useState(null);
  const [cart, setCart] = useState(null);

  useEffect(() => {
    if (!cart && cartId) {
      fetchCart(cartId);
    }
  }, [cart, cartId]);


  async function addItem(variantId, quantity = 1) {
    try {
      let idToUse = cartId;

      // 👇 ensure we have a usable cart ID
      if (!idToUse) {
        const newCart = await createCart(); // creates + sets
        idToUse = newCart.id;
        console.log("🆕 new cart created:", idToUse);
      }

      const query = `
        mutation addToCart($cartId: ID!, $lines: [CartLineInput!]!) {
          cartLinesAdd(cartId: $cartId, lines: $lines) {
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
                        id
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

      const variables = {
        cartId: idToUse,
        lines: [{ merchandiseId: variantId, quantity }],
      };

      console.log("📦 Final GraphQL payload:", { query, variables });

      const result = await shopifyFetch(query, variables);

      if (result?.cartLinesAdd?.cart) {
        setCart(result.cartLinesAdd.cart);
      } else {
        throw new Error("❌ Could not add item to cart – empty result");
      }
    } catch (err) {
      console.error("❌ Error in addItem:", err);
      throw err;
    }
  }

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
    const cart = data?.cartCreate?.cart;
    if (!cart) throw new Error("❌ cartCreate failed");

    const id = cart.id;
    localStorage.setItem("shopify_cart_id", id);
    setCartId(id);
    setCart(cart);

    return cart; // ✅ important: return the cart
  }

  async function fetchCart(id = cartId) {
    const finalId = id || cartId || localStorage.getItem("shopify_cart_id");
    if (!finalId) {
      console.warn("🚫 fetchCart called without a valid cart ID");
      return null;
    }
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

    const data = await shopifyFetch(query, { id: finalId });
    if (!data?.cart) throw new Error("❌ fetchCart failed");
    setCart(data.cart);
    return data.cart;
  }

  async function removeItem(lineId) {
    const idToUse = cartId || localStorage.getItem("shopify_cart_id");
    if (!idToUse || !lineId) {
      console.warn("🚫 removeItem called without valid cartId or lineId");
      return;
    }
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

    const variables = { cartId: idToUse, lineIds: [lineId] };
    const data = await shopifyFetch(query, variables);
    if (!data?.cartLinesRemove?.cart) throw new Error("❌ removeItem failed");
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
