import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CatalogPage from "./pages/CatalogPage";
import UpsellPage from "./pages/UpsellPage";
import PopoutCart from "./components/PopoutCart";
import CheckoutPage from "./pages/CheckoutPage";
import MysteryRewardPage from "./pages/MysteryRewardPage";
import { AnimatePresence } from "framer-motion";



export default function App() {
  const location = useLocation();
  const isShopPage = location.pathname === "/shop" || location.pathname.startsWith("/shop/view");

  // 🔁 add state to control cart visibility
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
  }, [cartOpen]);

  useEffect(() => {
    if (location.pathname === "/checkout") {
      setCartOpen(false); // 💀 force shut it down
    }
  }, [location.pathname]);



  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/shop"
          element={<CatalogPage openCart={() => setCartOpen(true)} />}
        />
        <Route
          path="/shop/view"
          element={<ProductPage openCart={() => setCartOpen(true)} />}
        />
        <Route path="/checkout" element={<CheckoutPage />} /> {/* 👈 add this */}
        <Route path="/shop/upsell" element={<UpsellPage />} />
        <Route path="/mystery" element={<MysteryRewardPage />} />
      </Routes>

      {location.pathname !== "/checkout" && (
        <AnimatePresence>
          {cartOpen && (
            <PopoutCart
              isCartOpen={cartOpen}
              onClose={() => setCartOpen(false)}
              key="popout-cart"
            />
          )}
        </AnimatePresence>
      )}
    </>
  );
}
