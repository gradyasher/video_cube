import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/HamburgerMenu.css";

const menuItems = [
  { label: "home", link: "/" },
  { label: "about", link: "/about" },
  { label: "shop", link: "/shop" },
  { label: "stream", link: "/stream" },
  { label: "email", link: "/email" },
  { label: "discord", link: "/discord" },
];

export default function HamburgerMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [mountMenu, setMountMenu] = useState(false);
  const navigate = useNavigate();

  const hasSpunSlotMachine = localStorage.getItem("hasSpun") === "true";
  const reward = localStorage.getItem("slotReward");

  useEffect(() => {
    if (isOpen) {
      setMountMenu(true);
    } else {
      const timeout = setTimeout(() => setMountMenu(false), 250);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  const handleVhsHoroscopeClick = () => {
    setIsOpen(false);
    if (!hasSpunSlotMachine) {
      navigate("/shop/mystery", { state: { fromInternal: true } });
    } else if (reward === "Glitch Reading") {
      navigate("/glitch-reading");
    } else {
      alert("You didn’t win a glitch reading… but you can nominate a friend to spin.");
    }
  };

  return (
    <div className="hamburger-root">
      <span
        onClick={() => setIsOpen(!isOpen)}
        className="hamburger-icon"
        dangerouslySetInnerHTML={{
          __html: isOpen
            ? `<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="48" height="48" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" stroke="#ccde01" stroke-width="2" stroke-linecap="square"/></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" fill="#ccde01" width="48" height="48" viewBox="0 0 24 24"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>`,
        }}
      />

      {mountMenu && (
        <div className={`menu-container ${isOpen ? "menu-fade-in" : "menu-fade-out"}`}>
          {[...menuItems, { label: "vhshoroscope", link: "vhs" }].map(({ label, link }, i) => {
            const isVhs = link === "vhs";
            const handleClick = isVhs
              ? handleVhsHoroscopeClick
              : () => setIsOpen(false);

            return (
              <div
                key={label}
                className="menu-item"
                style={{ animationDelay: `${i * 0.08}s` }}
                onClick={handleClick}
              >
                {isVhs ? (
                  <div className="label">{label.split("").map((c, j) => <span key={j}>{c}</span>)}</div>
                ) : (
                  <Link to={link} className="menu-link">
                    <div className="label">{label.split("").map((c, j) => <span key={j}>{c}</span>)}</div>
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
