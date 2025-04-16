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
    const listener = async (event) => {
      if (event.data === "video-closed") {
        setVideosWatched((prev) => {
          const updated = prev + 1;
          localStorage.setItem("videosWatched", updated.toString());

          // ✅ check server before redirecting
          if (updated >= 2 && !hasSeenMystery) {
            fetch("/api/check-claimed", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: localStorage.getItem("email") }), // if you're tracking email in localStorage
            })
              .then(res => res.json())
              .then(data => {
                if (!data.alreadyClaimed) {
                  localStorage.setItem("hasSeenMystery", "true");
                  navigate("/mystery");
                } else {
                  console.log("🎁 reward already claimed — no redirect");
                }
              });
          }

          return updated;
        });
      }
    };

  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}, [hasSeenMystery]);


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
