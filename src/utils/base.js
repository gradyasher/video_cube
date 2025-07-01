// src/utils/base.js
export const isBrowser = typeof window !== "undefined";

export const BASE_URL = isBrowser
  ? import.meta.env.BASE_URL || "/"
  : "/";
