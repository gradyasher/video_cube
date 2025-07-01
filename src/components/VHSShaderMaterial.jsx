import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { UniformsUtils } from "three";
import { vhsShader } from "../shaders/vhsShader";

export default function VHSShaderMaterial() {
  const shaderRef = useRef();

  const shader = useMemo(() => ({
    uniforms: {
      ...UniformsUtils.clone(vhsShader.uniforms),
      iTime: { value: 0 },
    },
    vertexShader: vhsShader.vertexShader,
    fragmentShader: vhsShader.fragmentShader,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  }), []);

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.iTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh position={[0, 0, 0.01]} renderOrder={Infinity}>
      <planeGeometry args={[20, 10]} />
      <shaderMaterial ref={shaderRef} args={[shader]} />
    </mesh>
  );
}
