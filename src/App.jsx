import * as React from "react";
import { lazy, Suspense } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Layout from "./Layout";


// Lazy-loaded route components
const Home = lazy(() => import("./pages/Home"));
const ShopRoutes = lazy(() => import("./ShopRoutes"));
const AdventurePage = lazy(() => import("./pages/AdventurePage"));
const StreamPage = lazy(() => import("./pages/StreamPage"));
const DiscordPage = lazy(() => import("./pages/DiscordPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const EmailPage = lazy(() => import("./pages/EmailPage"));

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const isShopPage = location.pathname === "/shop" || location.pathname.startsWith("/shop/view");
  const [cartOpen, setCartOpen] = React.useState(false);
  const [videosWatched, setVideosWatched] = React.useState(() => {
    return parseInt(localStorage.getItem("videosWatched") || "0", 10);
  });
  const [hasSeenMystery, setHasSeenMystery] = React.useState(() => {
    return localStorage.getItem("hasSeenMystery") === "true";
  });

  React.useEffect(() => {
    if (location.pathname === "/checkout") {
      setCartOpen(false);
    }
  }, [location.pathname]);

  React.useEffect(() => {
    const listener = async (event) => {
      if (event.data === "video-closed") {
        setVideosWatched((prev) => {
          const updated = prev + 1;
          localStorage.setItem("videosWatched", updated.toString());

          const email = localStorage.getItem("email");

          if (updated >= 2 && !hasSeenMystery && email) {
            fetch("/api/check-claimed", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email }),
            })
              .then(res => res.json())
              .then(data => {
                if (!data.alreadyClaimed) {
                  localStorage.setItem("hasSeenMystery", "true");
                  navigate("/mystery");
                } else {
                  console.log("🎁 reward already claimed — no redirect");
                }
              });
          }


          return updated;
        });
      }
    };

    window.addEventListener("message", listener);
    return () => window.removeEventListener("message", listener);
  }, [hasSeenMystery]);

  React.useEffect(() => {
    const handler = (e) => {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const isResetCombo =
        (isMac && e.metaKey && e.shiftKey && e.key === 'R') ||
        (!isMac && e.ctrlKey && e.shiftKey && e.key === 'R');

      if (isResetCombo) {
        localStorage.removeItem("videosWatched");
        localStorage.removeItem("hasSeenMystery");
        localStorage.removeItem("email");
        alert("🔁 local gating flags cleared!");
        window.location.reload();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <Suspense fallback={
       <div style={{
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
         height: '100vh',
         backgroundColor: 'black'
       }}>
         <img
           src="/assets/loading.png"
           alt="Loading"
           style={{ width: '150px', height: 'auto' }}
         />
       </div>
     }>
       <Routes>
         <Route element={<Layout />}>
           <Route path="/" element={<Home />} />
           <Route path="/stream" element={<StreamPage />} />
           <Route path="/discord" element={<DiscordPage />} />
           <Route path="/about" element={<AboutPage />} />
           <Route path="/email" element={<EmailPage />} />
         </Route>

         <Route path="/adventure" element={<AdventurePage />} />

         <Route path="/shop/*" element={<ShopRoutes />} />
         <Route path="/checkout" element={<ShopRoutes />} />
       </Routes>
      </Suspense>
    </>
  );
}
