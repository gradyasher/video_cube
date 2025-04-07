// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ShopPage from "./pages/Shop";
import ShopCatalogPage from "./pages/ShopCatalogPage";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<ShopCatalogPage />} />
      <Route path="/shop/view" element={<ShopPage />} />
    </Routes>
  );
}
