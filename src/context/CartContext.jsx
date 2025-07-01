// src/context/CartContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import useShopifyCart from "../hooks/useShopifyCart";

const CartContext = createContext(null);

function useReliableOfflineCheck() {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    async function verifyConnection() {
      try {
        await fetch("/api/ping", { cache: "no-store" });
        setIsOffline(false);
      } catch {
        setIsOffline(true);
      }
    }

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    // also check on mount + every 30s
    verifyConnection();
    const interval = setInterval(verifyConnection, 30000);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
      clearInterval(interval);
    };
  }, []);

  return isOffline;
}

export function CartProvider({ children }) {
  const cartHooks = useShopifyCart();
  const { cart, fetchCart, updateItemQuantity } = cartHooks;
  const [cartCount, setCartCount] = useState(0);

  const isOffline = useReliableOfflineCheck();


  // update count whenever cart changes
  useEffect(() => {
    const lines = cart?.lines?.edges || [];
    const total = lines.reduce((sum, line) => sum + line.node.quantity, 0);
    setCartCount(total);
  }, [cart]);

  // ensure cart is loaded on first mount
  useEffect(() => {
    if (!cart) {
      fetchCart();
    }
  }, [cart]); // ✅ still works once on mount, skips after it's set

  const contextData = { ...cartHooks, cartCount, isOffline }

  return (
    <CartContext.Provider value={contextData}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCartContext must be used within <CartProvider>");
  return ctx;
}
