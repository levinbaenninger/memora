import { useRouterState } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { AppSplash } from "@/modules/app/ui/views/app-splash";

const MIN_DISPLAY_MS = 700;
const FADE_MS = 400;

export function AppSplashOverlay() {
  const isLoading = useRouterState({ select: (s) => s.isLoading });
  const [show, setShow] = useState(true);
  const [fading, setFading] = useState(false);
  const mountedAt = useRef(Date.now());

  useEffect(() => {
    if (!show || fading || isLoading) {
      return;
    }
    const elapsed = Date.now() - mountedAt.current;
    const remaining = Math.max(0, MIN_DISPLAY_MS - elapsed);
    const fadeTimer = setTimeout(() => setFading(true), remaining);
    return () => clearTimeout(fadeTimer);
  }, [isLoading, show, fading]);

  useEffect(() => {
    if (!fading) {
      return;
    }
    const removeTimer = setTimeout(() => setShow(false), FADE_MS);
    return () => clearTimeout(removeTimer);
  }, [fading]);

  if (!show) {
    return null;
  }

  return (
    <div
      aria-hidden={fading}
      className="fixed inset-0 z-[100] transition-opacity ease-out"
      style={{
        opacity: fading ? 0 : 1,
        transitionDuration: `${FADE_MS}ms`,
        pointerEvents: fading ? "none" : "auto",
      }}
    >
      <AppSplash />
    </div>
  );
}
