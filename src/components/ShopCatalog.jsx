import React from "react";

const products = [
  {
    id: "glitch-tee",
    name: "glitch tee",
    price: "$29",
    model: "/models/2troofz.glb",
    image: "/assets/thumbnails/2troofz.png",
    link: "https://your-shop-link.com",
  },
  {
    id: "soundbath-shirt",
    name: "soundbath shirt",
    price: "$29",
    model: "/models/allover1.glb",
    image: "/assets/thumbnails/allover1.png",
    link: "https://your-shop-link.com",
  },

];


export default function ShopCatalog() {
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
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "2rem",
          maxWidth: "800px",         // 👈 keeps the grid narrow
          width: "100%",             // 👈 prevent overflow
        }}
      >
        {products.map((product, index) => (
          <div
            key={index}
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
              alt={product.alt}
              style={{
                width: "100%",
                height: "auto",
                marginBottom: "1rem",
              }}
            />
            <p style={{ color: "#CCDE01", fontSize: "1.1rem" }}>{product.name}</p>
            <p style={{ color: "#ccc", fontSize: "0.9rem" }}>{product.price}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
