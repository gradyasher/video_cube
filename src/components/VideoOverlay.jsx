import React, { useState, useRef } from "react";
import { hostedVideoLinks } from "../constants/videoSources";
import { BASE_URL } from "../utils/base";

export default function VideoOverlay({ activeVideoIndex, setActiveVideoIndex }) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const videoRef = useRef();

  const handleOverlayClick = () => {
    setActiveVideoIndex(null);
    window.postMessage("video-closed", "*");
    setIsVideoLoaded(false);
  };

  if (activeVideoIndex === null) return null;

  const videoUrl = hostedVideoLinks[activeVideoIndex];

  return (
    <>
      {/* 🌀 Loading effect */}
      {!isVideoLoaded && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 1001,
            width: "1000px",
            height: "1000px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0) 70%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={BASE_URL + "assets/loading.png"}
            alt="loading"
            style={{
              width: "300px",
              height: "auto",
            }}
          />
        </div>
      )}

      {/* 🎥 Video + text container */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 1000,
        }}
      >
        <video
          ref={videoRef}
          src={videoUrl}
          autoPlay
          muted={false}
          playsInline
          controls={false}
          loop={false}
          style={{
            maxWidth: "90vw",
            maxHeight: "90vh",
            width: "auto",
            height: "auto",
            objectFit: "contain",
            borderRadius: "12px",
            boxShadow: "0 0 80px rgba(187, 102, 255, 0.5)",
            opacity: isVideoLoaded ? 1 : 0,
            transition: "opacity 0.4s ease-in-out",
          }}
          onPlay={() => {
            setIsVideoLoaded(true);
            window.postMessage("video-playing", "*");
          }}
        />

        {isVideoLoaded && (
          <div
            style={{
              marginTop: "50px",
              textAlign: "center",
              color: "#ccde01",
              fontFamily: "Times New Roman, serif",
              fontStyle: "italic",
              fontSize: "1rem",
              letterSpacing: ".4em",
            }}
          >
            click outside to close
          </div>
        )}
      </div>

      {/* 🔲 Background overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          backgroundColor: "rgba(0, 0, 0, 0.9)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          backgroundImage:
            "radial-gradient(circle at center, rgba(187, 102, 255, 0.4), transparent 60%)",
        }}
        onClick={handleOverlayClick}
      />
    </>
  );
}
