import React, { lazy, Suspense } from "react";
import { Outlet } from "react-router-dom";

const HamburgerMenu = lazy(() => import("./components/HamburgerMenu"));

export default function Layout() {
  return (
    <>
      <Suspense fallback={null}>
        <HamburgerMenu />
      </Suspense>
      <Outlet />
    </>
  );
}
