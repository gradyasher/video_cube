import React, { forwardRef } from "react";

const VideoLayer = forwardRef(({ src, zIndex = 0, id, muted = false, loop = false }, ref) => {
  return (
    <video
      key={src}
      ref={ref}
      id={id}
      src={src}
      autoPlay
      muted={muted}
      loop={loop}
      playsInline
      style={{
        objectFit: "cover",
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: zIndex,
        transition: "opacity 0.5s ease-in-out",
      }}
    />
  );
});

export default VideoLayer;
