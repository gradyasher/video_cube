import React from "react";
import { Canvas } from "@react-three/fiber";
import BackgroundVideo from "../components/BackgroundVideo";
import ShopCatalog from "../components/ShopCatalog";
import { EffectComposer, Vignette } from "@react-three/postprocessing";


export default function ShopCatalogPage() {
  return (
    <div style={{ width: "100vw", height: "100vh", overflow: "hidden", position: "relative" }}>
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
        <div style={{ width: "100%", maxWidth: "1000px", padding: "0 2rem" }}>
          <h1
            style={{
              fontFamily: "Helvetica, sans-serif",
              fontWeight: "400",
              fontSize: "clamp(56px, 11vw, 144px)",
              color: "#CCDE01",
              letterSpacing: "-0.12em",
              lineHeight: "1.2em",
              textAlign: "center",
              marginTop: 0,
              marginBottom: "2rem",
            }}
          >
            catalog.
          </h1>
          <ShopCatalog />
        </div>
      </div>

    </div>
  );
}
