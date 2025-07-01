// src/ShopRoutes.jsx
import React, { lazy, Suspense, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { CartProvider } from "./context/CartContext";

const CatalogPage = lazy(() => import("./pages/CatalogPage"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const UpsellPage = lazy(() => import("./pages/UpsellPage"));
const PopoutCart = lazy(() => import("./components/PopoutCart"));
const MysteryRewardPage = lazy(() => import("./pages/MysteryRewardPage"));

export default function ShopRoutes() {
  const location = useLocation();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <Suspense fallback={<div className="shop-loading">🛒 Loading shop...</div>}>

        <Routes>
          <Route path="mystery" element={<MysteryRewardPage />} />
          {/* Matches /shop exactly */}
          <Route
            index
            element={
              <CatalogPage openCart={() => setCartOpen(true)} cartOpen={cartOpen} />
            }
          />

          {/* Matches /shop/view */}
          <Route
            path="view"
            element={
              <ProductPage openCart={() => setCartOpen(true)} cartOpen={cartOpen} />
            }
          />

          {/* Matches /shop/upsell */}
          <Route path="upsell" element={<UpsellPage />} />
        </Routes>

        {/* Show cart only if not on /checkout */}
        {location.pathname !== "/checkout" && cartOpen && (
          <PopoutCart
            isCartOpen={cartOpen}
            onClose={() => setCartOpen(false)}
            key="popout-cart"
          />
        )}
      </Suspense>
    </CartProvider>
  );
}
