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
import { bgVids } from "../constants/videoSources";
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
  const [recording, setRecording] = useState(true); // show hidden Canvas initially
  const [recordingComplete, setRecordingComplete] = useState(false);
  const deletionTimeoutRef = useRef(null);
  const showMain = bgReady && sphereReady;

  const [sphereVideoUrl] = useState(() => {
    const index = Math.floor(Math.random() * hostedVideoLinks.length);
    return hostedVideoLinks[index];
  });

  const [bgVideoUrl] = useState(() => {
    const index = Math.floor(Math.random() * hostedVideoLinks.length);
    return bgVids[index];
  });


  useCanvasRecorder({
    trigger: showMain && !videoUrl, // only start if page is ready and no video yet
    durationMs: 6000,
    onComplete: (url) => {
      setVideoUrl(url);
      setShowSharePrompt(true);
    },
  });

  useEffect(() => {
    if (recordingComplete) {
      setRecording(false); // triggers unmount of hidden Canvas
    }
  }, [recordingComplete]);


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
        text: "The sphere has chosen. 🌀",
        url: `${window.location.origin}${videoUrl}`,
      });
      console.log("✅ Shared via system menu");
      setUserShared(true); // prevent deletion
      clearTimeout(deletionTimeoutRef.current);
    } catch (err) {
      console.warn("❌ Share canceled or failed:", err);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LoadingScreen isLoading={!showMain} />
      <TitleOverlay text="the sphere has chosen." />

      <Canvas camera={{ position: [0, 0, 6.5] }} fog={{ color: "#000000", near: 2, far: 12 }}>
        <GlitchReadingContents
          sphereVideoUrl={sphereVideoUrl}
          bgVideoUrl={ bgVideoUrl }
          onSphereReady={() => {
            setSphereReady(true);
          }}
          onBgReady={() => setBgReady(true)}
        />
      </Canvas>
      <SoundbathLogo />

      {showMain && (
        <div
          style={{
            position: "absolute",
            bottom: "10vh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            color: "#ccff33", // text-lime-300
            fontSize: "0.875rem", // text-sm
            gap: "0.75rem", // Tailwind space-y-3
            zIndex: 10,
            pointerEvents: "none",
          }}
        >
          <p style={{
            fontFamily: 'Helvetica, sans-serif',
            fontSize: '0.875rem',
            textAlign: 'center',
            letterSpacing: '0.03em',
            color: '#ccff33',
            textShadow: '0 0 4px #ccff33aa',
          }}>
            share your reading & tag <span style={{ textDecoration: "underline" }}>@dgenrnation</span> to receive another transmission
          </p>
          <p style={{ fontSize: "0.75rem", pointerEvents: "auto" }}>🎲 Want a second gift? Nominate a friend to spin.</p>
          <Link to="/" style={{ textDecoration: "underline", pointerEvents: "auto" }}>
            &larr; back to home
          </Link>
        </div>
      )}

      {showMain && showSharePrompt && !showShareOptions && (
        <div
          style={{
            position: "absolute",
            bottom: "15vh",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            zIndex: 11,
            pointerEvents: "none",
          }}
        >
          <button
            onClick={() => setShowShareOptions(true)}
            style={{
              pointerEvents: "auto",
              color: "#ccff33",
              fontSize: "0.875rem",
              border: "1px solid #ccff33",
              padding: "0.25rem 0.75rem",
              borderRadius: "0.25rem",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          >
            share this reading with your friends
          </button>
        </div>
      )}

      {showShareOptions && videoUrl && (
        <div
          style={{
            position: "absolute",
            bottom: "20vh",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            zIndex: 12,
            pointerEvents: "none",
          }}
        >
          <div style={{ pointerEvents: "auto" }}>
            <InstagramShareButton
              videoUrl={window.location.origin + videoUrl}
              stickerUrl="https://dgenr8.world"
            />
          </div>

          {navigator.share && (
            <button
              onClick={shareToSystem}
              style={{
                pointerEvents: "auto",
                fontSize: "0.875rem",
                color: "#ccff33",
                textDecoration: "underline",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              or share using your system menu
            </button>
          )}

          <a
            href={videoUrl}
            download
            style={{
              pointerEvents: "auto",
              fontSize: "0.75rem",
              color: "rgba(255, 255, 255, 0.7)",
              textDecoration: "underline",
            }}
            onMouseEnter={(e) => (e.target.style.color = "white")}
            onMouseLeave={(e) => (e.target.style.color = "rgba(255, 255, 255, 0.7)")}
          >
            or download the video manually
          </a>
        </div>
      )}

      {recording && (
        <div style={{ width: 1440, height: 1800, position: "absolute", top: -9999 }}>
          <Canvas
            camera={{ position: [0, 0, 5], fov: 95 }}
            gl={{ preserveDrawingBuffer: true }}
          >
            <Suspense fallback={null}>
              <GlitchReadingContents
                sphereVideoUrl={sphereVideoUrl}
                bgVideoUrl={ bgVideoUrl }
                onSphereReady={() => console.log("🌀 capture sphere ready")}
                onBgReady={() => console.log("🎞️ capture bg ready")}
              />
            </Suspense>
          </Canvas>
        </div>
      )}
    </div>
  );
}
