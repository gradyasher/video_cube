// src/pages/CatalogPage.jsx
import React, { useEffect, useState, lazy, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { useCartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import { shopifyFetch } from "../utils/shopifyClient";
import { BASE_URL } from "../utils/base";
import styles from "../styles/CatalogPage.module.css";

const BackgroundVideo = lazy(() => import("../components/BackgroundVideo"));
const Catalog = lazy(() => import("../components/Catalog"));
const CartButton = lazy(() => import("../components/CartButton"));

export default function CatalogPage({ openCart, cartOpen }) {
  const { cartCount } = useCartContext();
  const [shopifyProducts, setShopifyProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      const query = `
        {
          products(first: 100) {
            edges {
              node {
                title
                variants(first: 100) {
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
        const parsed = data.products.edges.flatMap((edge) =>
          edge.node.variants.edges.map((v) => ({
            id: v.node.id,
            title: edge.node.title,
            price: v.node.price.amount,
          }))
        );
        setShopifyProducts(parsed);
        setLoading(false);
      } catch (err) {
        console.error("Failed to load Shopify data:", err);
      }
    }

    fetchProducts();
  }, []);

  return (
    <div className={styles.pageWrapper}>
      <Suspense fallback={null}>
        <Canvas
          camera={{ position: [0, 0, 5], near: 0.1, far: 1000 }}
          className={styles.canvas}
        >
          <BackgroundVideo scale={0.78} />
          <EffectComposer>
            <Vignette eskil={false} offset={0.3} darkness={1.4} />
          </EffectComposer>
        </Canvas>
      </Suspense>

      {loading ? (
        <div className={styles.loadingContainer}>
          <img
            src={`${BASE_URL}assets/loading.png`}
            alt="loading"
            className={styles.loadingImage}
          />
          <p className={styles.loadingText}>loading the goods...</p>
        </div>
      ) : (
        <div className={`${styles.contentContainer} ${styles.fadeIn}`}>
          {!cartOpen && (
            <Suspense fallback={null}>
              <CartButton cartCount={cartCount} openCart={openCart} />
            </Suspense>
          )}

          <Link to="/" className={styles.backLink}>
            ← back to home
          </Link>

          <div className={styles.catalogWrapper}>
            <h1 className={`${styles.heading} ${styles.slideIn}`}>shop.</h1>

            <Suspense fallback={<div>loading catalog...</div>}>
              <Catalog shopifyProducts={shopifyProducts} />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
}
