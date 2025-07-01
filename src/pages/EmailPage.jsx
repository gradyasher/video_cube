import React, { useState, useEffect } from "react";
import "../styles/EmailPage.css";

export default function EmailPage() {
  const [sent, setSent] = useState(false);
  const [visible, setVisible] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    message: "",
    fax: "", // honeypot
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
          message: formData.message,
          fax: formData.fax,
        }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const data = await res.json();
        alert(`Error: ${data.message || "Failed to send signal"}`);
      }
    } catch (err) {
      alert("Something glitched. Try again later.");
      console.error(err);
    }
  };

  return (
    <div className="signal-container">
      <div className={`signal-overlay fade-start ${visible ? "fade-in" : ""}`}>
        <h1 className="signal-title">join the email list for fun stuff. 📡</h1>

        {sent ? (
          <p className="confirmation">email received! <br /> thank u.</p>
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
      </div>
    </div>
  );
}
