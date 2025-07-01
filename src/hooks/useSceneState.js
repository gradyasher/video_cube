import { useState, useRef, useCallback } from "react";

export default function useSceneState() {

  const [bgReady, setBgReady] = useState(false);
  const [cubeReady, setCubeReady] = useState(false);
  const [showMain, setShowMain] = useState(false);
  const [hasClickedCube, setHasClickedCube] = useState(false);

  return {
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
