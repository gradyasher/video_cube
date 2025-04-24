// utils/cartUtils.js

export function getCartId() {
  const fromLocal = localStorage.getItem("cartId");
  const fromCookie = document.cookie
    .split("; ")
    .find((c) => c.startsWith("cartId="))
    ?.split("=")[1];
  return fromLocal || fromCookie || null;
}

export function nukeCartLocally() {
  document.cookie = "cartId=; Max-Age=0; path=/";
  localStorage.removeItem("cartId");
}

export async function resetCartCompletely() {
  const existingCartId = getCartId();
  console.log("🧪 Existing cartId:", existingCartId);

  // nuke client-side
  document.cookie = "cartId=; Max-Age=0; path=/";
  localStorage.removeItem("cartId");

  if (existingCartId) {
    try {
      const res = await fetch("/api/delete-cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartId: existingCartId }),
      });

      const result = await res.json();
      if (!res.ok) {
        console.error("❌ Failed to delete Shopify cart:", result.error);
      } else {
        console.log("✅ Shopify cart deletion success:", result);
      }

      await new Promise((r) => setTimeout(r, 750)); // let Shopify settle
    } catch (err) {
      console.error("❌ Network error during cart delete:", err);
    }
  }

  location.reload();
}

export function hasStickerInCart(cart, FREE_STICKER_VARIANT_ID) {
  return cart?.lines?.some(
    (item) => item.merchandise?.id === FREE_STICKER_VARIANT_ID
  );
}
