import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CatalogPage from "./pages/CatalogPage";
import PopoutCart from "./components/PopoutCart";

export default function App() {
  const location = useLocation();
  const isShopPage = location.pathname.startsWith("/shop");

  // 🔁 add state to control cart visibility
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    console.log("cartOpen changed:", cartOpen);
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

      {/* 🛒 only show cart on shop pages */}
      {isShopPage && cartOpen && <PopoutCart onClose={() => setCartOpen(false)} />}
    </>
  );
}
