import { useState } from "react";

export default function useSceneState() {

  const [bgReady, setBgReady] = useState(false);
  const [cubeReady, setCubeReady] = useState(false);
  const [hasClickedCube, setHasClickedCube] = useState(false);
  const [showHint, setShowHint] = useState(false);


  return {
    bgReady,
    setBgReady,
    cubeReady,
    setCubeReady,
    hasClickedCube,
    setHasClickedCube,
    showHint,
    setShowHint,
  };
}
