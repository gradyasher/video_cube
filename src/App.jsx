import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CatalogPage from "./pages/CatalogPage";
import PopoutCart from "./components/PopoutCart";
import { AnimatePresence } from "framer-motion";



export default function App() {
  const location = useLocation();
  const isShopPage = location.pathname.startsWith("/shop");

  // 🔁 add state to control cart visibility
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
  }, [cartOpen]);

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
      </Routes>

      {isShopPage && (
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
