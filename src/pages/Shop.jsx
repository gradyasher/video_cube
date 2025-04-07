import React from "react";
import { useLocation, Link } from "react-router-dom";
import ShopScene from "../components/ShopScene";
import TitleOverlay from "../components/TitleOverlay";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function ShopPage() {
  const query = useQuery();
  const modelParam = query.get("model"); // ✅ decode it
  const decodedModel = decodeURIComponent(modelParam);


  return (
    <div style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden" }}>
      <ShopScene modelPath={modelParam} /> {/* ✅ pass to ShopScene */}

      <div
        style={{
          position: "absolute",
          top: "5vh",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          zIndex: 20,
          pointerEvents: "none",
        }}
      >
        <TitleOverlay text="shop." />
      </div>

      <Link to="/" style={{ marginTop: "3rem", color: "#0ff", fontSize: "1.25rem" }}>
        ← back to home
      </Link>
    </div>
  );
}
