import React, { useRef, useState, Suspense, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { EffectComposer, Vignette } from "@react-three/postprocessing";
import { Vector3, MathUtils } from "three";
import { DirectionalLight, AmbientLight } from "three";
import { useNavigate } from "react-router-dom";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import BackgroundVideo from "./BackgroundVideo";
import VHSShaderMaterial from "./VHSShaderMaterial";
import { variantMap } from "../utils/variantMap";
import { BASE_URL } from "../utils/base";

const base = BASE_URL;
const models = Object.keys(variantMap);

// Manual GLTF loader
function useGLTFManual(url) {
  const [gltf, setGltf] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const loader = new GLTFLoader();
    loader.load(url, (data) => {
      if (isMounted) setGltf(data);
    });

    return () => {
      isMounted = false;
    };
  }, [url]);

  return gltf;
}

function FloatingShirt({ modelPath }) {
  const glb = useGLTFManual(modelPath);
  const ref = useRef();
  const targetPos = useRef(new Vector3(0, -1.2, 0));

  useEffect(() => {
    if (ref.current) {
      ref.current.rotation.y = 0;
      ref.current.position.set(-5, -2.2, -2);
      targetPos.current.set(0, -2.2, -2);
    }
  }, [modelPath]);

  useFrame(() => {
    if (ref.current) {
      const distance = Math.abs(ref.current.position.x);
      const spinSpeed = MathUtils.lerp(0.03, 0.01, 1 - Math.min(distance / 5, 1) * 15);
      ref.current.rotation.y += spinSpeed;
      ref.current.position.lerp(targetPos.current, 0.1);
    }
  });

  if (!glb) return null;

  return (
    <primitive
      ref={ref}
      object={glb.scene}
      scale={0.8}
    />
  );
}

function ProductScene({ initialModel }) {
  const initialIndex = models.findIndex((m) => m === initialModel);
  const [currentModelIndex, setCurrentModelIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const navigate = useNavigate();

  const handleNext = () => {
    const nextIndex = (currentModelIndex + 1) % models.length;
    navigate(`/shop/view?model=${encodeURIComponent(models[nextIndex])}`);
  };

  const handlePrev = () => {
    const prevIndex = (currentModelIndex - 1 + models.length) % models.length;
    navigate(`/shop/view?model=${encodeURIComponent(models[prevIndex])}`);
  };

  return (
    <div id="canvas-container">
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
        <ambientLight intensity={2} />
        <directionalLight position={[5, 5, 5]} intensity={2.2} color="#ffffff" />
        <directionalLight position={[-5, 2, 5]} intensity={0.5} color="#ccccff" />
        <directionalLight position={[0, 3, -5]} intensity={0.8} color="#ffccdd" />

        <BackgroundVideo />
        <Suspense fallback={null}>
          {models.map((path, index) =>
            index === currentModelIndex && <FloatingShirt key={path} modelPath={path} />
          )}
        </Suspense>
        <VHSShaderMaterial />
        <EffectComposer>
          <Vignette eskil={false} offset={0.3} darkness={1.4} />
        </EffectComposer>
      </Canvas>

      {/* UI Arrows */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "2vw",
          transform: "translateY(-50%)",
          zIndex: 100,
          cursor: "pointer",
        }}
        onClick={handlePrev}
      >
        <img src={`${base}assets/left_arrow.png`} alt="Previous shirt" style={{ width: "40px", height: "40px" }} />
      </div>
      <div
        style={{
          position: "absolute",
          top: "50%",
          right: "2vw",
          transform: "translateY(-50%)",
          zIndex: 100,
          cursor: "pointer",
        }}
        onClick={handleNext}
      >
        <img src={`${base}assets/right_arrow.png`} alt="Next shirt" style={{ width: "40px", height: "40px" }} />
      </div>
    </div>
  );
}

export default React.memo(ProductScene);
