// src/pages/CatalogPage.jsx

import React from "react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import BackgroundVideo from "../components/BackgroundVideo";
import Catalog from "../components/Catalog";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import useShopifyCart from "../hooks/useShopifyCart";

export default function CatalogPage({ openCart }) {
  const { cart } = useShopifyCart();

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
        fontFamily: "Helvetica, sans-serif",
        color: "#ccff00",
      }}
    >
      {/* 🎥 Background canvas with video */}
      <Canvas
        camera={{ position: [0, 0, 5], near: 0.1, far: 1000 }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <BackgroundVideo scale={0.78} />
        <EffectComposer>
          <Vignette eskil={false} offset={0.3} darkness={1.4} />
        </EffectComposer>
      </Canvas>

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          overflowY: "auto",
          paddingTop: "4vh",
        }}
      >
        {/* 🛒 cart button */}
        <button
          onClick={openCart}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            backgroundColor: "#ccff00",
            color: "#000",
            border: "none",
            padding: "0.65rem 1.4rem",
            borderRadius: "2rem",
            fontWeight: "bold",
            fontSize: "1rem",
            cursor: "pointer",
            boxShadow: "0 0 12px #ccff00",
            textTransform: "lowercase",
            transition: "transform 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
        >
          🛒 cart ({cart?.lines?.edges?.length || 0})
        </button>

        <div style={{ width: "100%", maxWidth: "1000px", padding: "0 2rem" }}>
          <motion.h1
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{
              fontFamily: "Helvetica, sans-serif",
              fontWeight: "400",
              fontSize: "clamp(56px, 11vw, 144px)",
              color: "#ccff00",
              letterSpacing: "-0.12em",
              lineHeight: "1.2em",
              textAlign: "center",
              marginTop: 0,
              marginBottom: "2rem",
            }}
          >
            shop.
          </motion.h1>
          <Catalog />
        </div>
      </div>
    </div>
  );
}
