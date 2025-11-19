// src/pages/EmailPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import "../styles/EmailPage.css";

export default function EmailPage() {
  const { variant } = useParams();
  const isLeadMagnet = Boolean(variant);

  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState("idle");

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    message: "",
    fax: "",
  });

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(timeout);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          firstName: formData.firstName,
          message: formData.message,
          fax: formData.fax,
          variant,
          source: variant ? `lead-magnet-${variant}` : "signal-form",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.message === "Already subscribed") {
          setStatus("already");
        } else {
          setStatus("subscribed");
        }
      } else {
        setStatus("error");
        alert(`Error: ${data.message || "Failed to send signal"}`);
      }
    } catch (err) {
      setStatus("error");
      alert("Something glitched. Try again later.");
      console.error(err);
    }
  };

  return (
    <div className="signal-container">
      <div className={`signal-overlay fade-start ${visible ? "fade-in" : ""}`}>

        {/* Heading + subtext */}
        {status === "idle" && (
          <>
            <h1 className="signal-title">
              {isLeadMagnet
                ? "enter your email to get this unreleased track"
                : "join the email list for fun stuff. 📡"}
            </h1>

            {isLeadMagnet && (
              <p className="signal-subtext">
                you’ll get the track + occasional updates. unsubscribe anytime.
              </p>
            )}
          </>
        )}

        {/* Success: first-time */}
        {status === "subscribed" && (
          <p className="confirmation">
            email received! <br /> thank u.
            {isLeadMagnet && (
              <>
                <br /><br />
                we'll send you your track today ☺️
              </>
            )}
            <br /><br />
            <a href="/" style={{ color: "#0ff", textDecoration: "underline" }}>
              ← home
            </a>
          </p>
        )}

        {/* Success: already subscribed */}
        {status === "already" && (
          <p className="confirmation">
            you're already on the list! <br />
            {isLeadMagnet && (
              <>
                we'll send you your track today ☺️
              </>
            )}
            <br /><br />
            <a href="/" style={{ color: "#0ff", textDecoration: "underline" }}>
              ← home
            </a>
          </p>
        )}

        {/* Error state */}
        {status === "error" && (
          <p className="confirmation">
            something glitched. try again later.
            <br /><br />
            <a href="/" style={{ color: "#0ff", textDecoration: "underline" }}>
              ← home
            </a>
          </p>
        )}

        {/* Form */}
        {status === "idle" && (
          <form className="signal-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder={
                isLeadMagnet ? "your email to unlock the track" : "your email"
              }
              required
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="text"
              name="firstName"
              placeholder="your first name (optional)"
              value={formData.firstName}
              onChange={handleChange}
            />
            <input
              type="text"
              name="fax"
              value={formData.fax}
              onChange={handleChange}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />
            {!isLeadMagnet && (
              <textarea
                name="message"
                placeholder="optional message..."
                rows={4}
                value={formData.message}
                onChange={handleChange}
              />
            )}
            <button type="submit">
              {isLeadMagnet ? "get the track" : "submit"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
