import React from "react";
import { BASE_URL } from "../utils/base";
import "../styles/LoadingScreen.css";

export default function LoadingScreen({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div className="loading-screen">
      <div className="loading-flicker-circle" />
      <img
        src={BASE_URL + "assets/loading.png"}
        alt="soundbath logo"
        className="loading-logo-flicker"
      />
    </div>
  );
}
