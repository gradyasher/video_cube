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

      if (!idToUse) {
        const storedId = (() => {
          try {
            return localStorage.getItem("shopify_cart_id");
          } catch {
            return null;
          }
        })();

        if (storedId) {
          idToUse = storedId;
          setCartId(storedId);
          await fetchCart(storedId);
        } else {
          const newCart = await createCart();
          idToUse = newCart.id;
          console.log("🆕 created new cart:", idToUse);
        }
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

      setCart(result.cartLinesAdd.cart);
      localStorage.setItem("shopify_cart_id", result.cartLinesAdd.cart.id);
    } catch (err) {
      console.error("❌ Error in addItem:", err);
      alert("Network issue: couldn't add item. Try again.");
    }
  }

  async function createCart() {
    try {
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

      return cart;
    } catch (err) {
      console.error("❌ Error in createCart:", err);
      alert("Network issue: couldn't create cart. Try again.");
      return null;
    }
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
      console.log("🧼 no valid cart ID — creating new cart via fetchCart()");
      return await createCart(); // this sets state and returns new cart
    }

    try {
      const query = `
        query getCart($id: ID!) {
          cart(id: $id) {
            id
            checkoutUrl
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
            }
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
      `;


      const data = await shopifyFetch(query, { id: finalId });
      if (!data?.cart) {
        console.warn("🗑 Cart expired or invalid — creating new cart...");
        return await createCart();
      }
      setCart(data.cart);
      return data.cart;
    } catch (err) {
      console.error("❌ fetchCart failed:", err);
      alert("Couldn't retrieve your cart. Try again later.");
      return null;
    }
  }

  async function removeItem(lineId) {
    const idToUse = cartId || localStorage.getItem("shopify_cart_id");
    if (!idToUse || !lineId) {
      console.warn("🚫 removeItem called without valid cartId or lineId");
      return;
    }

    try {
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
    } catch (err) {
      console.error("❌ Error in removeItem:", err);
      alert("Network issue: couldn't remove item. Try again.");
    }
  }

  async function updateItemQuantity(lineId, quantity) {
    if (quantity === 0) return removeItem(lineId);

    const idToUse = cartId || localStorage.getItem("shopify_cart_id");
    if (!idToUse || !lineId || quantity < 0) return;

    try {
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
    } catch (err) {
      console.error("❌ Error in updateItemQuantity:", err);
      alert("Could not update item quantity. Try again.");
    }
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
