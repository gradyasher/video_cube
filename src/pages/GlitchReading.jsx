import React, { useState, useRef, useEffect, Suspense, useMemo } from "react";
import { Canvas, extend } from "@react-three/fiber";
import { useParams } from "react-router-dom";
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
import SoundbathLogo from "../components/SoundbathLogo";
import useCanvasRecorderFromMainCanvas from "../hooks/useCanvasRecorderFromMainCanvas";
import { Instagram, Share2, Download } from "lucide-react";

extend({ UnrealBloomPass });

export default function GlitchReading({ isReferral = false }) {
  const { id: referrerId } = useParams();
  const [isSharing, setIsSharing] = useState(false);
  const [loadingTextIndex, setLoadingTextIndex] = useState(0);
  const [bgReady, setBgReady] = useState(false);
  const [sphereReady, setSphereReady] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [userShared, setUserShared] = useState(false);
  const [recording, setRecording] = useState(false);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const deletionTimeoutRef = useRef(null);

  const showMain = bgReady && sphereReady;

  useCanvasRecorderFromMainCanvas({
    trigger: recording,
    durationMs: 6000,
    fps: 10,
    onComplete: (url) => {
      setVideoUrl(url);
    },
  });

  const loadingPhrases = [
    "preparing ur media, don't click away....",
    "contacting server, just a bit longer...",
    "almost there!"
  ];


  const [sphereVideoUrl] = useState(() => {
    const index = Math.floor(Math.random() * hostedVideoLinks.length);
    return hostedVideoLinks[index];
  });

  const [bgVideoUrl] = useState(() => {
    const index = Math.floor(Math.random() * hostedVideoLinks.length);
    return bgVids[index];
  });

  const shareId = useMemo(() => {
    return videoUrl?.split("/").pop()?.replace(".mp4", "") || "unknown";
  }, [videoUrl]);

  const shareToSystem = async () => {
    if (!videoUrl) {
      console.warn("⚠️ No video URL available to share.");
      return;
    }

    const shareLink = `${window.location.origin}/glitch-reading/share/${shareId}`;
    setIsSharing(true);

    try {
      // ✅ Native share (mobile)
      if (navigator.share) {
        await navigator.share({
          title: "my VHS horoscope",
          text: "The sphere has chosen. 🌀",
          url: shareLink,
        });
      } else {
        // 🧠 Fallback for unsupported browsers (desktop)
        await navigator.clipboard.writeText(shareLink);
        alert("🔗 Link copied to clipboard!");
      }

      // ✅ On successful share (or copy)
      setUserShared(true);
      clearTimeout(deletionTimeoutRef.current);
      setShowEmailPrompt(true);

      // 📦 Log the referral if applicable
      if (referrerId) {
        fetch("/api/log-referral", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            referrerId,
            action: "shared",
          }),
        });
      }

    } catch (err) {
      console.warn("❌ Share failed or was cancelled:", err);
    } finally {
      setIsSharing(false);
    }
  };

  useEffect(() => {
    if (isReferral && referrerId) {
      fetch("/api/mailchimp/referral-opened", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: userEmail }),
      });
    }
  }, [isReferral, referrerId]);

  useEffect(() => {
    if (!recording || videoUrl) return;

    const interval = setInterval(() => {
      setLoadingTextIndex((prev) => (prev + 1) % loadingPhrases.length);
    }, 3000); // change text every 3 seconds

    return () => clearInterval(interval);
  }, [recording, videoUrl]);

  useEffect(() => {
    const handleUnload = () => {
      if (!userShared && videoUrl) {
        navigator.sendBeacon("/api/delete-glitch-video", JSON.stringify({ url: videoUrl }));
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [userShared, videoUrl]);


  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <LoadingScreen isLoading={!showMain} />
      <TitleOverlay text="the sphere has chosen." />

      <Canvas
        camera={{ position: [0, 0, 6.5] }}
        fog={{ color: "#000000", near: 2, far: 12 }}
        gl={{ preserveDrawingBuffer: true }}
      >
        <GlitchReadingContents
          sphereVideoUrl={sphereVideoUrl}
          bgVideoUrl={bgVideoUrl}
          onSphereReady={() => setSphereReady(true)}
          onBgReady={() => setBgReady(true)}
        />
      </Canvas>

      {showMain && !recording && !videoUrl && (
        <div
          style={{
            position: "absolute",
            bottom: "10vh", // 🔽 moved further down the screen
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            zIndex: 10,
            pointerEvents: "auto",
          }}
        >
          <p style={{
            fontSize: "clamp(16px, 5vw, 32px)", // ✅ responsive scaling
            fontFamily: "Helvetica, sans-serif",
            color: "#ccff33",
            marginBottom: "0.75rem",
            maxWidth: '80%',
            textAlign: "center",
            textShadow: "0 0 4px #ccff33aa",
            letterSpacing: "-0.05em"
          }}>
            Want another prize? Nominate a friend to spin or share us on social media!
          </p>
          <button
            onClick={() => setRecording(true)}
            style={{
              color: "#000",
              background: "#ccff33",
              fontSize: "1rem",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            Share
          </button>
          <Link
            to="/"
            style={{
              fontSize: "0.75rem",
              textDecoration: "underline",
              color: "#ccff33",
              marginTop: "1rem",
              zIndex:[9999]
            }}
          >
            ← back to home
          </Link>
        </div>
      )}


      {showMain && recording && !videoUrl && (
        <div
          style={{
            position: "absolute",
            bottom: "10vh", // pulled down for consistency
            width: "100%",
            textAlign: "center",
            fontSize: "clamp(18px, 6vw, 40px)", // responsive sizing
            fontFamily: "Helvetica, sans-serif",
            color: "#ccff33",
            textShadow: "0 0 4px #ccff33aa",
            zIndex: 10,
            pointerEvents: "none",
            letterSpacing: "-0.1em"
          }}
        >
          {loadingPhrases[loadingTextIndex]}
          <Link
            to="/"
            style={{
              fontSize: "0.75rem",
              textDecoration: "underline",
              color: "#ccff33",
              marginTop: "1rem",
              zIndex:[9999]
            }}
          >
            ← back to home
          </Link>
        </div>
      )}

      {showMain && videoUrl && (
        <div
          style={{
            position: "absolute",
            bottom: "10vh", // pulled down for consistency
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "1rem",
            zIndex: 12,
            pointerEvents: "auto",
          }}
        >
          <p
            style={{
              fontSize: "clamp(18px, 6vw, 40px)", // responsive sizing
              color: "#ccff33",
              fontFamily: "Helvetica, sans-serif",
              textShadow: "0 0 4px #ccff33aa",
              letterSpacing: "-0.1em",
              textAlign: "center" // ✅ center-align
            }}
          >
            Share your sphere with the world
          </p>


          <div style={{ display: "flex", gap: "1.5rem" }}>
            <div
              style={{
                width: "2rem",
                height: "2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
            >
              <Instagram className="w-full h-full text-[#ccff33]" />
            </div>

            <div
              style={{
                width: "2rem",
                height: "2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              onClick={shareToSystem}
            >
              <Share2 className="w-full h-full text-[#ccff33]" />
            </div>

            <div
              style={{
                width: "2rem",
                height: "2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "transform 0.2s ease-in-out",
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.2)"}
              onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
              className="w-8 h-8 cursor-pointer hover:scale-110 transition"
              onClick={async () => {
                try {
                  const res = await fetch(videoUrl, { method: "HEAD" });
                  if (!res.ok) throw new Error("File no longer available");

                  const a = document.createElement("a");
                  a.href = videoUrl;
                  a.download = "glitch-reading.mp4";
                  a.click();

                  setTimeout(() => {
                    fetch("/api/delete-glitch-video", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ url: videoUrl }),
                    });
                    setUserShared(true);
                  }, 1000);
                } catch (err) {
                  alert("⚠️ Your video expired. Please generate a new one.");
                }
              }}>
              <Download className="w-full h-full text-[#ccff33]" />
            </div>
          </div>
          <Link
            to="/"
            style={{
              fontSize: "0.75rem",
              textDecoration: "underline",
              color: "#ccff33",
              marginTop: "1rem",
              zIndex:[9999]
            }}
          >
            ← back to home
          </Link>
        </div>
      )}
      {showEmailPrompt && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.9)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
        >
          <p
            style={{
              color: "#ccff33",
              fontFamily: "Helvetica, sans-serif",
              fontSize: "1.5rem",
              textAlign: "center",
              maxWidth: "80%",
              marginBottom: "1.5rem",
              textShadow: "0 0 4px #ccff33aa",
            }}
          >
            thanks for sharing your sphere. <br />
            drop your email to unlock your gift —<br />
            and get a secret bonus if your friend opens the link 👁‍🗨
          </p>

          <input
            type="email"
            placeholder="your@email.com"
            value={userEmail}
            onChange={(e) => setUserEmail(e.target.value)}
            style={{
              padding: "0.75rem 1rem",
              fontSize: "1rem",
              borderRadius: "0.25rem",
              border: "none",
              outline: "none",
              width: "260px",
              marginBottom: "1rem",
            }}
          />

          <button
            onClick={async () => {
              const referred = referrerId || "origin";

              try {
                const res = await fetch("/api/claim-referral", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email: userEmail, shareId, referred }),
                });

                if (res.status === 409) {
                  alert("⚠️ You’ve already claimed this reward from this device or email.");
                } else if (!res.ok) {
                  alert("❌ Something went wrong. Please try again.");
                } else {
                  setShowEmailPrompt(false);
                  alert("🎁 your reward is on the way!");
                }
              } catch (err) {
                console.error("❌ Claim error:", err);
                alert("❌ Network error. Please try again later.");
              }
            }}
            style={{
              background: "#ccff33",
              color: "#000",
              fontWeight: "bold",
              padding: "0.5rem 1rem",
              borderRadius: "0.25rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Claim My Reward
          </button>
          <Link
            to="/"
            style={{
              fontSize: "0.75rem",
              textDecoration: "underline",
              color: "#ccff33",
              marginTop: "1rem",
              zIndex:[9999]
            }}
          >
            ← back to home
          </Link>
        </div>
      )}
    </div>
  );
}
