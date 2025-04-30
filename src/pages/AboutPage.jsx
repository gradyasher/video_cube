import React from "react";
import { motion } from "framer-motion";
import "./AboutPage.css";

export default function AboutPage() {
  const webms = [
    "/videos/about_webms/gorp_clip.webm",
    "/videos/about_webms/icia_clip.webm",
    "/videos/about_webms/madmans_clip.webm",
    "/videos/about_webms/melatone_clip_1.webm",
    "/videos/about_webms/melatone_clip_2.webm",
    "/videos/about_webms/unseen_clip.webm",
  ];

  return (
    <div className="about-container">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/videos/glitch-loop.mp4" type="video/mp4" />
      </video>

      <motion.div
        className="about-overlay"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="about-title">about dgenr8</h1>

        <div className="about-content">
          <p>
            <strong>Dgenr8</strong> is the audiovisual manifestation of the Next Place.
            We know where this is going—and it might not be “pretty”—but it will be radical.
          </p>

          <VideoClip src={webms[0]} />

          <p>
            Based in KCMO, this project chronicles the adventures of city boy Graz:
            a musical street urchin and garbageman by trade who’s done enough time in the
            trenches of the Empire to drive a man past the brink 100 times over.
            Maybe you see a reflection in him when he decides to say enough.
          </p>

          <p>
            Enough garbage. Enough spiritual slavery.
          </p>

          <VideoClip src={webms[2]} />

          <p>
            Enough bad math. Enough one-sided rules.
          </p>

          <p>
            From that rupture, <strong>Dgenr8</strong> is born: not a noun,
            a verb. An impulse. A refusal.
          </p>

          <VideoClip src={webms[3]} />

          <p>
            Join our rotating cast of deadbeat geniuses as they carve something out of the chaos—
            scraps of sound, flickers of light, transmission fragments from the Next Place.
          </p>

          <VideoClip src={webms[1]} />

          <p>
            As the systems of control refine themselves into every crevice of our being,
            we’re left with no choice but to find light within.
            It’s a gift, in a way.
          </p>

          <VideoClip src={webms[4]} />

          <p className="outro-line">
            The pleasure of watching it all… <strong>Dgenr8.</strong>
          </p>

          <VideoClip src={webms[5]} />
        </div>

        <div className="footer-nav">
          <a href="/">← back to home</a>
        </div>
      </motion.div>
    </div>
  );
}

// 🔁 Reusable video component
function VideoClip({ src }) {
  return (
    <video
      autoPlay
      loop
      muted
      playsInline
      src={src}
      className="about-gif"
    />
  );
}
