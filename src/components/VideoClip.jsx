import { useEffect, useRef, useState } from "react";
import "../styles/VideoClip.css";

export default function VideoClip({ src }) {
  const ref = useRef(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // only trigger once
        }
      },
      { rootMargin: "0px 0px -20% 0px" }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      autoPlay
      loop
      muted
      playsInline
      src={src}
      className={`about-gif ${isInView ? "clip-visible" : "clip-hidden"}`}
    />
  );
}
