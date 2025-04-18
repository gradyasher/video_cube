// src/pages/CatalogPage.jsx

import { React, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import BackgroundVideo from "../components/BackgroundVideo";
import Catalog from "../components/Catalog";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { useCartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { shopifyFetch } from "../utils/shopifyClient";

export default function CatalogPage({ openCart }) {
  const { cart, cartCount, addItem, isOffline } = useCartContext();
  const [shopifyProducts, setShopifyProducts] = useState([]);
  const [loading, setLoading] = useState(true);


  const itemCount = cart?.lines?.edges?.reduce((sum, edge) => sum + edge.node.quantity, 0) || 0;

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const query = `
        {
          products(first: 10) {
            edges {
              node {
                title
                variants(first: 10) {
                  edges {
                    node {
                      id
                      price { amount }
                    }
                  }
                }
              }
            }
          }
        }
      `;

      try {
        const data = await shopifyFetch(query);
        const parsed = data.products.edges.flatMap((edge) => {
          return edge.node.variants.edges.map((v) => ({
            id: v.node.id,
            title: edge.node.title,
            price: v.node.price.amount,
          }));
        });
        setLoading(false);
        setShopifyProducts(parsed);
      } catch (err) {
        console.error("Failed to load Shopify data:", err);
      }
    }

    fetchProducts();
  }, []);

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
      {loading ? (
        <div
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            paddingTop: "8vh",
          }}
        >
          <img
            src="/assets/loading.png"
            alt="loading"
            style={{ width: "150px", height: "auto", marginBottom: "1.5rem" }}
          />
          <p style={{ fontFamily: "monospace", color: "#ccff00", fontSize: "1rem" }}>
            loading the goods...
          </p>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{
            position: "relative",
            zIndex: 10,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            overflowY: "auto",
            paddingTop: "8vh",
          }}
        >
          {/* 🛒 cart button */}
          <button
            onClick={openCart}
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              backgroundColor: isOffline ? "#444" : "#CCDE01",
              color: isOffline ? "#999" : "#000",
              border: "none",
              padding: "0.65rem 1.4rem",
              borderRadius: "2rem",
              fontWeight: "bold",
              fontSize: "1rem",
              cursor: isOffline ? "not-allowed" : "pointer",
              opacity: isOffline ? 0.6 : 1,
              boxShadow: "0 0 12px #ccff00",
              textTransform: "lowercase",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            🛒 cart ({cartCount})
          </button>

          <Link
            to="/"
            style={{
              position: "absolute",
              top: "1rem",
              left: "1rem",
              color: "#0ff",
              fontSize: "1.1rem",
              fontFamily: "monospace",
              textDecoration: "none",
              textTransform: "lowercase",
              background: "transparent",
              border: "none",
              padding: "0.4rem 0.75rem",
              borderRadius: "0.5rem",
              transition: "all 0.2s ease",
              zIndex: 30,
            }}
          >
            ← back to home
          </Link>

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

            <Catalog shopifyProducts={shopifyProducts} />
          </div>
        </motion.div>
      )}
    </div>
  );
}
