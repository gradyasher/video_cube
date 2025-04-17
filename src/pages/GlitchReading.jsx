import React, { Suspense } from "react";
import { Canvas, extend } from "@react-three/fiber";
import * as THREE from "three";
import { UnrealBloomPass } from "three-stdlib";
import TitleOverlay from "../components/TitleOverlay";
import VHSShaderMaterial from "../components/VHSShaderMaterial";
import VolumetricScattering from "../components/VolumetricScattering";
import BackgroundVideo from "../components/BackgroundVideo";
import { hostedVideoLinks } from "../constants/videoSources";
import GlitchReadingContents from "../components/GlitchReadingContents";
import LoadingScreen from "../components/LoadingScreen";
import HamburgerMenu from "../components/HamburgerMenu";
import SoundbathLogo from "../components/SoundbathLogo";
import MusicPlayer from "../components/MusicPlayer";
import { Link } from "react-router-dom";

extend({ UnrealBloomPass });

export default function GlitchReading() {
  const [bgReady, setBgReady] = React.useState(false);
  const [sphereReady, setSphereReady] = React.useState(false);
  const showMain = bgReady && sphereReady;

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LoadingScreen isLoading={!showMain} />
      <TitleOverlay text="the sphere has chosen."/>
      <Canvas camera={{ position: [0, 0, 6.5] }} fog={{ color: '#000000', near: 2, far: 12 }}>
        <GlitchReadingContents
          onSphereReady={() => setSphereReady(true)}
          onBgReady={() => setBgReady(true)}
        />
      </ Canvas>
      <SoundbathLogo />
      <MusicPlayer />
      {showMain && (
        <div className="absolute bottom-10 w-full flex flex-col items-center text-lime-300 text-sm space-y-3">
          <p>share your reading & tag <span className="underline">@dgenrnation</span> to receive another transmission</p>
          <p className="text-xs">🎲 Want a second gift? Nominate a friend to spin.</p>
          <Link to="/" className="hover:underline">&larr; back to home</Link>
        </div>
      )}
    </div>
  );
}
