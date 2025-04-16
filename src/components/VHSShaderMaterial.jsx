import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Plane } from "@react-three/drei";
import { vhsShader } from "../shaders/vhsShader";

export default function VHSShaderMaterial() {
  const shaderRef = useRef();

  const shader = useMemo(() => vhsShader, []);

  useFrame(({ clock }) => {
    if (shaderRef.current) {
      shaderRef.current.uniforms.iTime.value = clock.getElapsedTime();
    }
  });

  return (
    <Plane args={[20, 10]} position={[0, 0, 0.01]} renderOrder={Infinity}>
      <shaderMaterial
        ref={shaderRef}
        attach="material"
        args={[shader]}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </Plane>
  );
}
