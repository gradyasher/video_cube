// src/components/SlotMachine.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';


const rewardPool = [
  "free sticker pack",
  "unreleased track",
  "glitch zine pdf",
  "10% off code",
  "glitch reading",
  "private livestream access",
];

// calculate longest reward width in characters
const longestReward = rewardPool.reduce((a, b) => (a.length > b.length ? a : b));
const approxCharWidth = 20; // monospace, estimate ~20px per character
const minWidth = `${longestReward.length * approxCharWidth}px`;

export default function SlotMachine({ onFinish }) {
  const [spinning, setSpinning] = useState(false);
  const [displayed, setDisplayed] = useState("?");
  const [finalReward, setFinalReward] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);

  const submitEmail = async () => {
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("please enter a valid email");
      return;
    }

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      let result = {};
      try {
        result = await res.json(); // might fail if no JSON returned
      } catch (_) {}

      if (!res.ok) {
        if (result.message === "Already subscribed") {
          console.log("✅ Already on the list");
          setEmailSubmitted(true);
          return;
        }
        throw new Error(result.error || "subscription failed");
      }


      console.log("✅ email submitted to Mailchimp:", email);
      setEmailSubmitted(true);
    } catch (err) {
      console.error("❌ submission error:", err.message || err);
      alert("Something went wrong while subscribing.");
    }
  };


  useEffect(() => {
    let interval;

    if (spinning) {
      const final = rewardPool[Math.floor(Math.random() * rewardPool.length)];

      setSpinning(true);
      setDisplayed("...");
      setFinalReward(null);

      let ticks = 0;
      interval = setInterval(() => {
        const randomReward = rewardPool[Math.floor(Math.random() * rewardPool.length)];
        setDisplayed(randomReward);
        setAnimationKey(Math.random());
        ticks++;

        if (ticks > 80) {
          clearInterval(interval);
          setDisplayed(final);
          setFinalReward(final);
          onFinish(final);
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#CCFF00', '#00fff7', '#ffffff'],
          });
        }
      }, 40);
    }

    return () => clearInterval(interval);
  }, [spinning]);


  const startSpin = () => {
    setSpinning(true);
    setDisplayed("...");
    setFinalReward(null);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{
          padding: "5vw 2vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          boxSizing: "border-box"
        }}

      >
        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          src="./assets/soundbath.png"
          alt="gongboi mascot"
          style={{ width: "100px", marginTop: "2rem" }}
        />
        <motion.p
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{
            fontFamily: 'helvetica',
            fontSize: '2.3rem',
            color: '#CCFF00',
            letterSpacing: '-0.13em',
            lineHeight: '1.1',
            marginBottom: '1.5rem',
            maxWidth: '460px',
            textAlign: 'center',
            marginInline: 'auto',
          }}

        >
          congratulations! you've been selected to receive one of the following gifts:
        </motion.p>
        <ul style={{
          marginTop: "0rem",
          fontFamily: "monospace",
          fontSize: "1rem",
          color: "#ccc",
          textAlign: "center",
          listStyle: "none",
          padding: 0,
          lineHeight: "1.8",
        }}>
          {rewardPool.map((reward, idx) => (
            <li key={idx} style={{ marginBottom: "0.25rem", color: "#CCFF00" }}>
              • {reward}
            </li>
          ))}
        </ul>

        {!emailSubmitted && (
          <div style={{ marginBottom: "1rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <input
              type="email"
              placeholder="enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                borderRadius: "1rem",
                border: "2px solid #ccff00",
                backgroundColor: "#000",
                color: "#ccff00",
                fontFamily: "monospace",
                textAlign: "center",
                width: "260px",
                maxWidth: "80vw",
              }}
            />
            <button
              onClick={() => {
                if (!emailSubmitted) {
                  if (/\S+@\S+\.\S+/.test(email)) {
                    setEmailSubmitted(true);
                    submitEmail(); // <- make sure this is async
                  } else {
                    alert("please enter a valid email");
                  }
                  return;
                }

                startSpin(); // this should run only after emailSubmitted is true
              }}

              style={{
                background: "#ccff00",
                color: "#000",
                fontWeight: "bold",
                padding: "0.5rem 1rem",
                borderRadius: "1rem",
                border: "none",
                cursor: "pointer",
                fontFamily: "monospace"
              }}
            >
              submit email →
            </button>
          </div>
        )}

        {emailSubmitted && (
          <>
            <div
              style={{
                textAlign: "center",
                fontFamily: "monospace",
                color: "#CCFF00",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: "1.6rem",
                  marginBottom: "1rem",
                  minHeight: "2em",
                  minWidth: "clamp(200px, 80vw, 500px)",
                  maxWidth: "90vw",
                  background: "#CCFF00",
                  color: "#000",
                  padding: "0.5rem 1.25rem",
                  borderRadius: "0.75rem",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={animationKey}
                    initial={{ y: "100%", opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: "-100%", opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{
                      position: "absolute",
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      textAlign: "center",
                    }}
                  >
                    {displayed}
                  </motion.div>

                </AnimatePresence>
              </div>

              {!emailSubmitted && (
                <>
                  <ul style={{
                    marginTop: "2rem",
                    fontFamily: "monospace",
                    fontSize: "1rem",
                    color: "#ccc",
                    textAlign: "center",
                    listStyle: "none",
                    padding: 0,
                    lineHeight: "1.8",
                  }}>
                    {rewardPool.map((reward, idx) => (
                      <li key={idx} style={{ marginBottom: "0.25rem", color: "#CCFF00" }}>
                        • {reward}
                      </li>
                    ))}
                  </ul>

                  <input
                    type="email"
                    placeholder="enter your email to spin"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={{
                      padding: "0.75rem 1rem",
                      borderRadius: "1rem",
                      border: "none",
                      marginBottom: "1rem",
                      fontSize: "1rem",
                      width: "100%",
                      maxWidth: "400px",
                      textAlign: "center",
                    }}
                  />
                </>
              )}

              {!finalReward && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  onClick={startSpin}
                  disabled={spinning}
                  style={{
                    fontSize: "1rem",
                    padding: "0.75rem 1.5rem",
                    background: "#00fff7",
                    color: "#000",
                    border: "none",
                    borderRadius: "1rem",
                    fontWeight: "bold",
                    cursor: spinning ? "not-allowed" : "pointer",
                    boxShadow: "0 0 10px #00fff7",
                    maxWidth: "90vw",
                    marginInline: "auto"
                  }}
                >
                  {spinning ? "spinning..." : "reveal my reward →"}
                </motion.button>
              )}



              {finalReward && (
                <p style={{ marginTop: "1.25rem", color: "#fff", fontSize: "0.9rem" }}>
                  you received: <strong>{finalReward}</strong>
                </p>
              )}
            </div>
          </>
        )}
      </motion.div>
    </>
  );
}
