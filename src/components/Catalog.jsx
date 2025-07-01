import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { variantMap } from "../utils/variantMap";
import { BASE_URL } from "../utils/base";
import "../styles/Catalog.css";

export default function Catalog({ shopifyProducts }) {
  const navigate = useNavigate();
  const [loaded, setLoaded] = useState(false);

  const preferredSizes = ["L", "XL", "M", "S"];

  const products = Object.entries(variantMap).map(([model, val]) => {
    const variantId = preferredSizes.map((size) => val.variants[size]).find(Boolean);
    if (!variantId) return null;

    const matchingProduct = shopifyProducts.find((p) => p.id === variantId);
    if (!matchingProduct) return null;

    return {
      id: matchingProduct.id,
      name: matchingProduct.title || matchingProduct.name,
      price: matchingProduct.price,
      model,
      image: val.image || BASE_URL + "assets/placeholder.png",
    };
  }).filter(Boolean);

  return (
    <div className="catalog-container">
      <div className="catalog-grid">
        {products.map((product, index) => (
          <div
            key={product.id}
            className="catalog-item fade-in"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() =>
              navigate(`/shop/view?model=${encodeURIComponent(product.model)}`)
            }
          >
            <div className="catalog-img-wrapper">
              <img
                src={product.image}
                alt={product.name}
                onLoad={() => setLoaded(true)}
                className="catalog-img"
                style={{ opacity: loaded ? 1 : 0 }}
              />
            </div>
            <p className="catalog-name">{product.name}</p>
            <p className="catalog-price">{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
