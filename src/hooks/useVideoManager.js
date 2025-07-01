import { useState, useRef, useEffect, useCallback } from "react";
import { hostedVideoLinks } from "../constants/videoSources";

export default function useVideoManager() {
  const [activeVideoIndex, setActiveVideoIndex] = useState(null);
  const iframeRef = useRef(null);

  const initializeYouTubeAPI = useCallback(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  const handleOverlayClick = useCallback(() => {
    setActiveVideoIndex(null);
    if (iframeRef.current) {
      iframeRef.current.src = "";
    }
  }, []);

  useEffect(() => {
    if (activeVideoIndex !== null && iframeRef.current) {
      const videoId = hostedVideoLinks[activeVideoIndex].split("v=")[1];
      iframeRef.current.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=0&enablejsapi=1`;
    }
  }, [activeVideoIndex]);

  return {
    activeVideoIndex,
    setActiveVideoIndex,
    iframeRef,
    initializeYouTubeAPI,
    handleOverlayClick,
  };
}
