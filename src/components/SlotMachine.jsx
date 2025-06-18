// src/components/SlotMachine.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import { useNavigate, Link } from "react-router-dom";
import { rewardMap } from "../constants/rewardMap";
import RewardFollowUp from "./RewardFollowUp";
import { useCartContext } from "../context/CartContext";
import { resetCartCompletely } from "/src/utils/cartUtils";
import { BASE_URL } from "../utils/base";

const rewardPool = Object.keys(rewardMap);
const longestReward = rewardPool.reduce((a, b) => (a.length > b.length ? a : b));
const approxCharWidth = 20;
const minWidth = `${longestReward.length * approxCharWidth}px`;

export default function SlotMachine({ onFinish }) {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [displayed, setDisplayed] = useState("?");
  const [finalReward, setFinalReward] = useState(null);
  const [animationKey, setAnimationKey] = useState(0);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const { cart, cartId, addItem, fetchCart } = useCartContext();

  const retryUntilCartId = async (attempts = 3) => {
    for (let i = 0; i < attempts; i++) {
      const id = localStorage.getItem("shopify_cart_id");
      if (id) return id;
      await new Promise((r) => setTimeout(r, 200));
    }
    return null;
  };

  const submitEmail = async (finalRewardOverride = null) => {
    // test for email format
    if (!/\S+@\S+\.\S+/.test(email)) {
      alert("please enter a valid email");
      return;
    }


    const rewardToSend = finalRewardOverride || finalReward;
    let idToUse = cartId || (await retryUntilCartId());

    // check for missing data
    if (!rewardToSend || !idToUse) {
      console.warn("❌ Missing reward or cartId during email submission.");
      console.log("rewardToSend: ", rewardToSend);
      console.log("cartId: ", idToUse);
      return;
    }

    try {
      // send email and selected reward to backend
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          reward: rewardToSend,
          cartId: idToUse,
        }),
      });


      const result = await res.json();
      // check result
      if (!res.ok) {
        throw new Error(result.error || "subscription failed");
      }

      console.log("✅ email + reward submitted:", email, "→", rewardToSend);

      // redirect home if they already
      if (result.alreadyClaimed) {
        setAlreadyClaimed(true);
        setTimeout(() => {
          navigate("/");
        }, 3000);
        return;
      }

      setEmailSubmitted(true);
    } catch (err) {
      console.error("❌ submission error:", err);
      alert("Something went wrong while subscribing.");
    }
  };

  useEffect(() => {
    // spinning animation
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

          const maybeAddSticker = async () => {
            // add sticker 2 cart if that's what they roll
            if (final !== "free sticker with purchase!") return;
            let idToUse = cartId || (await retryUntilCartId());
            if (!idToUse) {
              console.warn("🚫 No cart ID found — skipping sticker add.");
              return;
            }

            try {
              const res = await fetch("/api/add-free-sticker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartId: idToUse }),
              });

              const result = await res.json();

              if (res.status === 409) {
                console.log("🛑 Sticker already in cart — backend prevented duplicate");
              } else if (res.ok) {
                console.log("🧃 Sticker added to cart via backend");
                await fetchCart(idToUse); // 🛍️ refresh local cart state so UI updates
              } else {
                console.error("❌ Backend failed to add sticker:", result?.error || result);
              }
            } catch (err) {
              console.error("❌ Failed to call add-free-sticker endpoint:", err);
            }
          };

          const maybeGenerateDiscount = async () => {
            if (final === "10% off code" && email && !alreadyClaimed) {
              try {
                const res = await fetch("/api/generate-discount", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ email }),
                });
                const result = await res.json();
                console.log("🎟️ Generated discount code:", result.code);
              } catch (err) {
                console.error("❌ Discount code generation failed", err);
              }
            }
          };

          maybeAddSticker();
          maybeGenerateDiscount();

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#CCFF00', '#00fff7', '#ffffff'],
          });

          if (email && !alreadyClaimed) {
            submitEmail(final);
          }
        }
      }, 40);

      const rewardMeta = rewardMap[final];
      if (rewardMeta?.redirect) {
        let secondsLeft = 8;
        const countdown = setInterval(() => {
          secondsLeft -= 1;
          setCountdown(secondsLeft);

          if (secondsLeft <= 0) {
            clearInterval(countdown);
            navigate(rewardMeta.redirect);
          }
        }, 1000);
      }
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
          padding: "5vw 0vw",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          width: "100%",
          boxSizing: "border-box"
        }}
      >
        <button onClick={resetCartCompletely}>
          reset shopify cart (dev only)
        </button>

        <motion.img
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          src={BASE_URL + "assets/soundbath.png"}
          alt="gongboi mascot"
          style={{ width: "100px", marginTop: "0rem" }}
        />
        {alreadyClaimed ? (
          <p style={{
            fontFamily: "monospace",
            fontSize: "1rem",
            color: "#ccff00",
            maxWidth: "420px",
            textAlign: "center",
          }}>
            you've already claimed your mystery reward. for more free stuff join us on Discord!
          </p>
        ) : (
          <>
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
              <div style={{ marginBottom: "0rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>

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
                        setEmailSubmitted(true); // ✅ mark email ready
                      } else {
                        alert("please enter a valid email");
                      }
                    } else {
                      startSpin(); // ✅ only spin after email is "submitted"
                    }
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
                  {emailSubmitted ? "reveal my reward →" : "submit email →"}
                </button>

                <p style={{ color: "#aaa", fontSize: "0.75rem", marginTop: "0rem" }}>
                  one entry per email address. for more free stuff join us on Discord!
                </p>
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
                      marginBottom: "0rem",
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

                  {!finalReward && (
                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.4 }}
                      onClick={startSpin}
                      disabled={
                        spinning || rewardMap[finalReward]?.isEmailReward
                      }
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
                    <p style={{ marginTop: "0.5rem", color: "#fff", fontSize: "0.9rem" }}>
                      you received: <strong>{finalReward}</strong>
                    </p>
                  )}
                  {finalReward && <RewardFollowUp reward={finalReward} countdown={countdown} />}
                  <Link to="/" style={{ display: "block", marginTop: "2rem", textAlign: "center", color: "#ccff00", fontSize: "0.875rem" }}>
                    ← back to home
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </motion.div>
    </>
  );
}
