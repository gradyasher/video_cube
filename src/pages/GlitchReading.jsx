import React, { useState, useRef, useEffect, Suspense } from "react";
import { Canvas, extend } from "@react-three/fiber";
import * as THREE from "three";
import { UnrealBloomPass } from "three-stdlib";
import { Link } from "react-router-dom";
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
import useCanvasRecorder from "../hooks/useCanvasRecorder";
import InstagramShareButton from "../components/InstagramShareButton";


extend({ UnrealBloomPass });

export default function GlitchReading() {
  const [bgReady, setBgReady] = useState(false);
  const [sphereReady, setSphereReady] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [showSharePrompt, setShowSharePrompt] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [userShared, setUserShared] = useState(false);
  const deletionTimeoutRef = useRef(null);
  const showMain = bgReady && sphereReady;

  useCanvasRecorder({
    trigger: showMain && !videoUrl, // only start if page is ready and no video yet
    durationMs: 2000,
    onComplete: (url) => {
      setVideoUrl(url);
      setShowSharePrompt(true);
    },
  });

  useEffect(() => {
    const checkForVideo = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/latest-glitch-video`);
        const data = await res.json();
        console.log("📦 fetched:", data);

        if (data?.url && !videoUrl) { // <-- already fetched? skip
          setVideoUrl(data.url);
          setShowSharePrompt(true);
        } else {
          console.warn("No URL returned in response");
        }
      } catch (e) {
        console.error("❌ Failed to fetch video:", e);
      }
    };

    checkForVideo();
  }, []);



  useEffect(() => {
    if (!videoUrl || !showMain) return;

    deletionTimeoutRef.current = setTimeout(() => {
      if (!userShared) {
        fetch("http://localhost:3001/api/delete-glitch-video", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: videoUrl }),
        });
        console.log("🗑️ Video deleted due to inactivity");
      }
    }, 30000);

    return () => clearTimeout(deletionTimeoutRef.current);
  }, [videoUrl, showMain]);


  const shareToSystem = async () => {
    if (!videoUrl || !navigator.share) return;

    try {
      await navigator.share({
        title: "my VHS horoscope",
        text: "the sphere has chosen. 🌀",
        url: `${window.location.origin}${videoUrl}`,
      });

      console.log("✅ Shared successfully");
      setUserShared(true);
      clearTimeout(deletionTimeoutRef.current);
    } catch (err) {
      console.warn("❌ Share canceled:", err);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LoadingScreen isLoading={!showMain} />
      <TitleOverlay text="the sphere has chosen." />
      <Canvas camera={{ position: [0, 0, 6.5] }} fog={{ color: "#000000", near: 2, far: 12 }}>
        <GlitchReadingContents
          onSphereReady={() => setSphereReady(true)}
          onBgReady={() => setBgReady(true)}
        />
      </Canvas>
      <SoundbathLogo />

      {showMain && (
        <div className="absolute bottom-10 w-full flex flex-col items-center text-lime-300 text-sm space-y-3">
          <p>
            share your reading & tag <span className="underline">@dgenrnation</span> to receive
            another transmission
          </p>
          <p className="text-xs">🎲 Want a second gift? Nominate a friend to spin.</p>
          <Link to="/" className="hover:underline">
            &larr; back to home
          </Link>
        </div>
      )}

      {showMain && showSharePrompt && !showShareOptions && (
        <button
          onClick={() => setShowShareOptions(true)}
          className="absolute bottom-24 text-lime-300 text-sm hover:underline z-50"
        >
          share this reading with your friends
        </button>
      )}



      {showShareOptions && videoUrl && (
        <div className="absolute bottom-24 w-full flex flex-col items-center space-y-3">
          <InstagramShareButton
            videoUrl={window.location.origin + videoUrl}
            stickerUrl="https://dgenr8.world"
          />
          <button
            onClick={shareToSystem}
            className="mt-2 text-sm text-lime-300 underline hover:opacity-80"
          >
            or share using your system menu
          </button>
        </div>
      )}

    </div>
  );
}
