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

      // 🛡 Ensure we have a cart ID, or create one
      if (!idToUse || !cart?.lines?.edges?.length) {
        const newCart = await createCart();
        idToUse = newCart.id;
        console.log("🆕 created new cart:", idToUse);
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

      const result = await shopifyFetch(query, variables);

      // 🔁 If cart was invalid (expired or bad ID), recreate and retry once
      if (!result?.cartLinesAdd?.cart) {
        console.warn("🗑 Shopify rejected cart. Retrying with new cart...");
        const newCart = await createCart();
        const retryVariables = {
          cartId: newCart.id,
          lines: [{ merchandiseId: variantId, quantity }],
        };
        const retryResult = await shopifyFetch(query, retryVariables);

        if (!retryResult?.cartLinesAdd?.cart) {
          throw new Error("❌ Retry with new cart also failed");
        }

        setCart(retryResult.cartLinesAdd.cart);
        localStorage.setItem("shopify_cart_id", retryResult.cartLinesAdd.cart.id);
        return;
      }

      // ✅ Success case
      setCart(result.cartLinesAdd.cart);
      localStorage.setItem("shopify_cart_id", result.cartLinesAdd.cart.id);
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
    let storedId = null;
    try {
      storedId = localStorage.getItem("shopify_cart_id");
    } catch (err) {
      console.error("🧨 error reading cart from localStorage", err);
    }

    const finalId = id || cartId || storedId;
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
    if (!data?.cart) {
      console.warn("🗑 Cart expired or invalid — creating new cart...");
      const newCart = await createCart();
      return newCart;
    }
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

  async function updateItemQuantity(lineId, quantity) {
    if (quantity === 0) {
      return removeItem(lineId); // gracefully fallback to delete
    }

    const idToUse = cartId || localStorage.getItem("shopify_cart_id");
    if (!idToUse || !lineId || quantity < 0) return;

    const query = `
      mutation updateCartItem($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
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

    const variables = {
      cartId: idToUse,
      lines: [{ id: lineId, quantity }],
    };

    const data = await shopifyFetch(query, variables);
    if (!data?.cartLinesUpdate?.cart) throw new Error("❌ updateItemQuantity failed");
    setCart(data.cartLinesUpdate.cart);
  }


  return {
    cartId,
    cart,
    addItem,
    removeItem,
    fetchCart,
    updateItemQuantity,
  };
}
