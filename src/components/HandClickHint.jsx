import React, { useEffect, useState } from "react";
import { BASE_URL } from "../utils/base";
import "../styles/HandClickHint.css";

export default function HandClickHint({ show }) {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (show) {
      setShouldRender(true);
      const timer = setTimeout(() => setShouldRender(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!shouldRender) return null;

  return (
    <>
      <img
        src={BASE_URL + "assets/win95-hand.png"}
        alt="Click hint"
        className="hand-click-hint"
      />
      <div className="hand-click-text">click the{"\n"}cube</div>
    </>
  );
}
