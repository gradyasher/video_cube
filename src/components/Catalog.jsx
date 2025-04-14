import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";


const products = [
  {
    id: "2 troofz n a lye - dgenr8 Tee",
    name: "2 troofz n a lye - dgenr8 Tee",
    price: "$29",
    model: "/models/2troofz.glb",
    image: "/assets/thumbnails/2troofz.png"
  },
  {
    id: "Psychedelic Vortex Soundbath Unisex T-Shirt",
    name: "Psychedelic Vortex Soundbath Unisex T-Shirt",
    price: "$29",
    model: "/models/allover2.glb",
    image: "/assets/thumbnails/allover2.png"
  },
  {
    id: "soundbath. Radiowave Hoodie (All Over Print)",
    name: "soundbath. Radiowave Hoodie (All Over Print)",
    price: "$50",
    model: "/models/hoodie1.glb",
    image: "/assets/thumbnails/hoodie1.png"
  },

];


export default function Catalog() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",   // center the full grid
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "2rem",
          padding: "2rem",
          maxWidth: "800px",         // 👈 keeps the grid narrow
          width: "100%",
          margin: "0 auto",            // 👈 prevent overflow
        }}
      >
        {products.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              ease: "easeOut",
              delay: index * 0.1, // stagger animation for each item
            }}
            onClick={() =>
              navigate(`/shop/view?model=${encodeURIComponent(product.model)}`)
            }
            style={{
              textAlign: "center",
              cursor: "pointer",
              transition: "transform 0.3s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <img
              src={product.image}
              alt={product.name}
              style={{
                width: "100%",
                height: "auto",
                marginBottom: "1rem",
              }}
            />
            <p style={{ color: "#CCDE01", fontSize: "1.1rem" }}>{product.name}</p>
            <p style={{ color: "#ccc", fontSize: "0.9rem" }}>{product.price}</p>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
