// src/context/CartContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import useShopifyCart from "../hooks/useShopifyCart";

const CartContext = createContext();

export function CartProvider({ children }) {
  const cartHooks = useShopifyCart();
  const { cart, fetchCart, updateItemQuantity } = cartHooks;
  const [cartCount, setCartCount] = useState(0);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // offline disable
  useEffect(() => {
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

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


  return (
    <CartContext.Provider value={{ ...cartHooks, cartCount, isOffline }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCartContext() {
  return useContext(CartContext);
}
