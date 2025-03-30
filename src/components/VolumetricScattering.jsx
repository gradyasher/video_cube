import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree, extend } from "@react-three/fiber";
import { Plane, useFBO, shaderMaterial } from "@react-three/drei";
import * as THREE from "three";
import { VolumetricMaterial } from "../shaders/volumetricMaterial";


extend({ VolumetricMaterial });

export default function VolumetricScattering() {
  const material = useRef();
  const fbo = useFBO();
  const screen = useRef();
  const { gl, scene, camera } = useThree();
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => {
      setReady(true);
    });
  }, []);

  useFrame(() => {
    if (!initialized.current || !ready) {
      initialized.current = true;
      return;
    }

    if (screen.current) screen.current.visible = false;

    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    if (screen.current) screen.current.visible = true;
    if (material.current) material.current.tDiffuse = fbo.texture;
  }, 1);

  if (!ready) return null;

  return (
    <Plane args={[2, 2]} position={[0, 0, 0]} renderOrder={999} ref={screen}>
      <volumetricMaterial
        ref={material}
        lightPosition={new THREE.Vector2(0.5, 0.5)}
      />
    </Plane>
  );
}
