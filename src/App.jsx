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
  const [cartOpen, setCartOpen] = useState(false);
  const [videosWatched, setVideosWatched] = useState(() => {
    return parseInt(localStorage.getItem("videosWatched") || "0", 10);
  });
  const [hasSeenMystery, setHasSeenMystery] = useState(() => {
    return localStorage.getItem("hasSeenMystery") === "true";
  });


  useEffect(() => {
  }, [cartOpen]);

  useEffect(() => {
    if (location.pathname === "/checkout") {
      setCartOpen(false); // 💀 force shut it down
    }
  }, [location.pathname]);

  useEffect(() => {
    const listener = (event) => {
      if (event.data === "video-closed") {
        if (localStorage.getItem("hasSeenMystery") === "true") return;

        setVideosWatched((prev) => {
          const updated = prev + 1;
          localStorage.setItem("videosWatched", updated.toString());

          if (updated >= 2) {
            localStorage.setItem("hasSeenMystery", "true");
            window.location.href = "/mystery";
          }

          return updated;
        });
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, []);



  useEffect(() => {
    if (videosWatched >= 2 && !hasSeenMystery && location.pathname === "/") {
      setHasSeenMystery(true);
      localStorage.setItem("hasSeenMystery", "true");
      window.location.href = "/mystery";
    }
  }, [videosWatched, hasSeenMystery, location.pathname]);



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
        <Route path="/checkout" element={<CheckoutPage />} />
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
