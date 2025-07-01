// src/components/SlotMachine.jsx
import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import { useNavigate, Link } from "react-router-dom";
import { rewardMap } from "../constants/rewardMap";
import RewardFollowUp from "./RewardFollowUp";
import { useCartContext } from "../context/CartContext";
import { BASE_URL } from "../utils/base";
import "../styles/SlotMachine.css"; // ← new styles

const rewardPool = Object.keys(rewardMap);

export default function SlotMachine({ onFinish }) {
  const navigate = useNavigate();
  const [spinning, setSpinning] = useState(false);
  const [displayed, setDisplayed] = useState("?");
  const [finalReward, setFinalReward] = useState(null);
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [alreadyClaimed, setAlreadyClaimed] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const { cartId, fetchCart } = useCartContext();

  const retryUntilCartId = async (attempts = 3) => {
    for (let i = 0; i < attempts; i++) {
      const id = localStorage.getItem("shopify_cart_id");
      if (id) return id;
      await new Promise((r) => setTimeout(r, 200));
    }
    return null;
  };

  const submitEmail = async (override = null) => {
    if (!/\S+@\S+\.\S+/.test(email)) return alert("please enter a valid email");
    const rewardToSend = override || finalReward;
    let idToUse = cartId || (await retryUntilCartId());
    if (!rewardToSend || !idToUse) return console.warn("Missing data for reward submission.");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, reward: rewardToSend, cartId: idToUse }),
      });
      const result = await res.json();

      if (!res.ok) throw new Error(result.error);
      if (result.alreadyClaimed) {
        setAlreadyClaimed(true);
        setTimeout(() => navigate("/"), 3000);
        return;
      }
      setEmailSubmitted(true);
    } catch (err) {
      console.error("Error submitting:", err);
    }
  };

  const startSpin = () => {
    setSpinning(true);
    setDisplayed("...");
    setFinalReward(null);
  };

  useEffect(() => {
    let interval;
    if (spinning) {
      const final = rewardPool[Math.floor(Math.random() * rewardPool.length)];
      let ticks = 0;

      interval = setInterval(() => {
        setDisplayed(rewardPool[Math.floor(Math.random() * rewardPool.length)]);
        ticks++;
        if (ticks > 80) {
          clearInterval(interval);
          setDisplayed(final);
          setFinalReward(final);
          onFinish(final);

          if (final === "free sticker with purchase!") {
            retryUntilCartId().then((id) => {
              if (!id) return;
              fetch("/api/add-free-sticker", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ cartId: id }),
              })
                .then((res) => res.json())
                .then(() => fetchCart(id));
            });
          }

          if (final === "10% off code" && email && !alreadyClaimed) {
            fetch("/api/generate-discount", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            }).then((res) => res.json());
          }

          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#CCFF00", "#00fff7", "#ffffff"],
          });

          if (email && !alreadyClaimed) submitEmail(final);
        }
      }, 40);

      const meta = rewardMap[final];
      if (meta?.redirect) {
        let secs = 8;
        const countdown = setInterval(() => {
          secs--;
          setCountdown(secs);
          if (secs <= 0) {
            clearInterval(countdown);
            navigate(meta.redirect);
          }
        }, 1000);
      }
    }

    return () => clearInterval(interval);
  }, [spinning]);

  return (
    <div className="slot-root">
      <img src={BASE_URL + "assets/soundbath.png"} alt="gongboi mascot" className="slot-img" />

      {alreadyClaimed ? (
        <p className="slot-msg">you've already claimed your reward. join us on Discord for more.</p>
      ) : (
        <>
          <p className="slot-heading">
            congratulations! you've been selected to receive one of the following gifts:
          </p>
          <ul className="slot-list">
            {rewardPool.map((reward, i) => (
              <li key={i}>• {reward}</li>
            ))}
          </ul>

          {!emailSubmitted && (
            <div className="slot-email-box">
              <input
                type="email"
                placeholder="enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="slot-input"
              />
              <button
                className="slot-btn"
                onClick={() => {
                  if (!emailSubmitted && /\S+@\S+\.\S+/.test(email)) {
                    setEmailSubmitted(true);
                  } else if (emailSubmitted) {
                    startSpin();
                  } else {
                    alert("please enter a valid email");
                  }
                }}
              >
                {emailSubmitted ? "reveal my reward →" : "submit email →"}
              </button>
              <p className="slot-disclaimer">one entry per email. join our Discord for more free stuff!</p>
            </div>
          )}

          {emailSubmitted && (
            <div className="slot-reveal">
              <div className="slot-display">{displayed}</div>

              {!finalReward && (
                <button
                  className="slot-btn spin"
                  onClick={startSpin}
                  disabled={spinning}
                >
                  {spinning ? "spinning..." : "reveal my reward →"}
                </button>
              )}

              {finalReward && (
                <>
                  <p className="slot-won">you received: <strong>{finalReward}</strong></p>
                  <RewardFollowUp reward={finalReward} countdown={countdown} />
                  <Link to="/" className="slot-home-link">← back to home</Link>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
