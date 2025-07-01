import React, { useRef, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { WebGLRenderTarget, LinearFilter, RGBAFormat, Vector2 } from "three";
import { VolumetricMaterial } from "../shaders/volumetricMaterial";

export default function VolumetricScattering() {
  const material = useRef();
  const mesh = useRef();
  const fboRef = useRef();
  const initialized = useRef(false);
  const [ready, setReady] = useState(false);

  const { gl, scene, camera, size } = useThree();

  useEffect(() => {
    const fbo = new WebGLRenderTarget(size.width, size.height, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
      format: RGBAFormat,
    });
    fbo.texture.name = "volumetricFBO";
    fboRef.current = fbo;

    return () => fbo.dispose();
  }, [size]);

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

    const fbo = fboRef.current;
    if (!fbo) return;

    if (mesh.current) mesh.current.visible = false;

    gl.setRenderTarget(fbo);
    gl.clear();
    gl.render(scene, camera);
    gl.setRenderTarget(null);

    if (mesh.current) mesh.current.visible = true;
    if (material.current) {
      material.current.uniforms.tDiffuse.value = fbo.texture;
    }
  }, 1);

  if (!ready) return null;

  return (
    <mesh
      ref={mesh}
      position={[0, 0, 0]}
      renderOrder={999}
    >
      <planeGeometry args={[2, 2]} />
      <primitive
        attach="material"
        object={new VolumetricMaterial({ lightPosition: new Vector2(0.5, 0.5) })}
        ref={material}
      />
    </mesh>
  );
}
