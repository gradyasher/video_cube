import { useState, useRef, useCallback } from "react";
import * as THREE from "three";

export default function useSceneState() {
  const [fogColor, setFogColor] = useState(new THREE.Color(0x88ccff));
  const fogColorTarget = useRef(fogColor.clone());

  const [bgReady, setBgReady] = useState(false);
  const [cubeReady, setCubeReady] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [hasClickedCube, setHasClickedCube] = useState(false);

  return {
    fogColor,
    setFogColor,
    fogColorTarget,
    bgReady,
    setBgReady,
    cubeReady,
    setCubeReady,
    showMain,
    setShowMain,
    hasClickedCube,
    setHasClickedCube,
  };
}
