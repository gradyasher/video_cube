// src/pages/UpsellPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { BASE_URL } from "../utils/base";
import "../styles/UpsellPage.css"; // ← add this for animation styles

export default function UpsellPage() {
  const navigate = useNavigate();
  const [imgVisible, setImgVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setImgVisible(true), 10); // allow DOM paint
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="upsell-container">
      <Link to="/shop" className="upsell-backlink">
        ← back to catalog
      </Link>

      <h1 className="upsell-title">ready to check out?</h1>
      <p className="upsell-desc">
        when you're ready, let's review your order and make sure everything looks good.
      </p>

      <img
        src={BASE_URL + "assets/thumbnails/stickers.png"}
        alt="checkout illustration"
        className={`glow-img ${imgVisible ? "fade-in-scale" : "fade-start-scale"}`}
      />

      <button className="upsell-button" onClick={() => navigate("/checkout")}>
        go to checkout →
      </button>
    </div>
  );
}
