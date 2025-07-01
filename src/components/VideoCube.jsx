import React, { useRef, useEffect, useMemo, useState } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import {
  Raycaster,
  Vector2,
  Vector3,
  TextureLoader,
  VideoTexture,
  Color,
  MeshStandardMaterial,
  MathUtils,
} from "three";
import { cubeFaces, cubeThumbs } from "../constants/videoSources";

export default function VideoCube({ showScene, onFaceClick, onCubeReady }) {
  const mesh = useRef();
  const { gl, camera, size } = useThree();
  const raycaster = useMemo(() => new Raycaster(), []);
  const mouse = useMemo(() => new Vector2(), []);
  const isMobile = size.width < 768;

  const [flickerIndex, setFlickerIndex] = useState(null);
  const [flickerValue, setFlickerValue] = useState(0);
  const [flickerColor, setFlickerColor] = useState(new Color());
  const [entered, setEntered] = useState(false);
  const [textures, setTextures] = useState([]);

  const flickerTimeout = useRef(null);
  const nextTriggerTimeout = useRef(null);
  const animationFrame = useRef(null);
  const targetPosition = new Vector3(0, 0, 0);

  useEffect(() => {
    if (showScene && mesh.current) {
      mesh.current.position.set(0, -2, 5);
      setEntered(true);
    }
  }, [showScene]);

  useEffect(() => {
    let loaded = 0;
    const thumbTextures = new Array(cubeThumbs.length);

    cubeThumbs.forEach((thumb, idx) => {
      new TextureLoader().load(thumb, (loadedTexture) => {
        thumbTextures[idx] = { texture: loadedTexture, isVideo: false };
        loaded++;

        if (loaded === cubeThumbs.length) {
          setTextures(thumbTextures);
          onCubeReady?.();

          cubeFaces.forEach((src, vIdx) => {
            const video = document.createElement("video");
            video.src = src;
            video.crossOrigin = "anonymous";
            video.loop = true;
            video.muted = true;
            video.playsInline = true;
            video.setAttribute("webkit-playsinline", "true");
            video.setAttribute("playsinline", "true");

            video.addEventListener("canplay", () => {
              const videoTexture = new VideoTexture(video);
              video.play().catch((e) => console.warn("Autoplay failed", e));
              setTextures((prev) => {
                const next = [...prev];
                next[vIdx] = { texture: videoTexture, isVideo: true };
                return next;
              });
            });

            video.load();
          });
        }
      });
    });
  }, []);

  const materials = useMemo(
    () =>
      textures.map(
        (entry) =>
          new MeshStandardMaterial({
            map: entry.texture,
            emissive: new Color(0x000000),
            emissiveIntensity: 0,
            emissiveMap: null,
            toneMapped: false,
          })
      ),
    [textures]
  );

  useEffect(() => {
    const handleClick = (event) => {
      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(mesh.current, true);
      if (intersects.length > 0) {
        const faceIndex = intersects[0].face.materialIndex;
        onFaceClick(faceIndex);
      }
    };
    window.addEventListener("pointerdown", handleClick);
    return () => window.removeEventListener("pointerdown", handleClick);
  }, [gl, camera, raycaster, mouse, onFaceClick]);

  useEffect(() => {
    const scheduleFlicker = () => {
      const interval = Math.random() * 500 + 250;
      nextTriggerTimeout.current = setTimeout(() => {
        const randomFace = Math.floor(Math.random() * 6);
        const pastelHue = Math.random();
        const pastelColor = new Color().setHSL(pastelHue, 0.9, 0.95);
        setFlickerIndex(randomFace);
        setFlickerColor(pastelColor);
        setFlickerValue(0);

        let progress = 0;
        const duration = 1000;
        const start = performance.now();

        const animate = (now) => {
          progress = now - start;
          const t = Math.min(progress / duration, 1);
          const eased = t * t * (3 - 2 * t);
          const clamped = Math.max(0, Math.min(3 * eased, 3));
          setFlickerValue(clamped);

          if (t < 1) {
            animationFrame.current = requestAnimationFrame(animate);
          } else {
            setFlickerValue(0);
            setFlickerIndex(null);
            scheduleFlicker();
          }
        };

        animationFrame.current = requestAnimationFrame(animate);
      }, interval);
    };

    scheduleFlicker();
    return () => {
      clearTimeout(flickerTimeout.current);
      clearTimeout(nextTriggerTimeout.current);
      cancelAnimationFrame(animationFrame.current);
    };
  }, []);

  useFrame((_, delta) => {
    if (entered && mesh.current) {
      mesh.current.position.lerp(targetPosition, 1 - Math.exp(-5 * delta));
    }

    mesh.current.rotation.z += 0.004;
    mesh.current.rotation.y += 0.006;
    mesh.current.rotation.x += 0.0025;

    materials.forEach((material, index) => {
      if (!material) return;
      const target = index === flickerIndex ? flickerValue : 0;
      if (index === flickerIndex) material.emissive.copy(flickerColor);
      material.emissiveIntensity = MathUtils.lerp(material.emissiveIntensity, target, 0.08);
    });
  });

  return (
    <mesh ref={mesh} scale={isMobile ? [1.8, 1.8, 1.8] : [2.5, 2.5, 2.5]}>
      <boxGeometry args={[1, 1, 1]} />
      {materials.map((material, index) => (
        <primitive key={index} attach={`material-${index}`} object={material} />
      ))}
    </mesh>
  );
}
