import React, { useState } from "react";
import { motion } from "framer-motion";
import "./SignalPage.css";

export default function EmailPage() {
  const [sent, setSent] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    message: "",
    fax: "", // 👈 honeypot
  });


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🚨 Replace this with your backend/Mailchimp call
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/signal`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          message: formData.message,
          fax: formData.fax, // 👈 include the honeypot
        }),
      });


      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || 'Failed to send signal'}`);
      }
    } catch (err) {
      alert("Something glitched. Try again later.");
      console.error(err);
    }

  };

  return (
    <div className="signal-container">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/videos/glitch-loop.mp4" type="video/mp4" />
      </video>

      <motion.div
        className="signal-overlay"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <h1 className="signal-title">join the email list for fun stuff. 📡</h1>

        {sent ? (
          <motion.p
            className="confirmation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            email received! <br />
            thank u.
          </motion.p>
        ) : (
          <form className="signal-form" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="your email"
              required
              value={formData.email}
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

            <textarea
              name="message"
              placeholder="optional message..."
              rows={4}
              value={formData.message}
              onChange={handleChange}
            />
            <button type="submit">submit</button>
          </form>
        )}

        <div className="footer-nav">
          <a href="/">← back to home</a>
        </div>
      </motion.div>
    </div>
  );
}
