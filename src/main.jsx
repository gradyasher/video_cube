// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { CartProvider } from "./context/CartContext"; // ← make sure this path is right
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider> {/* 🧩 This enables global cart state */}
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>
);
