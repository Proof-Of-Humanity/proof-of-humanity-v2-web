"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

const MAX_OFFSET = 20;

interface RequestCardParallaxProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a request Card and drives the vertical scroll parallax on the media
 * inside it. As the card travels through the viewport, the `request-card-media`
 * element is translated via the `--request-card-media-offset` CSS variable
 * (see globals.css). Self-contained and ref-scoped, so it works on any page
 * (e.g. the profile page) without the registry grid's global driver.
 */
export default function RequestCardParallax({
  children,
  className,
}: RequestCardParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const viewportHeight = window.innerHeight;
      const rect = el.getBoundingClientRect();
      const scrollProgress =
        (rect.top + rect.height / 2 - viewportHeight / 2) /
        ((viewportHeight + rect.height) / 2);
      const offset = Math.max(
        -MAX_OFFSET,
        Math.min(MAX_OFFSET, scrollProgress * -MAX_OFFSET),
      );
      el.style.setProperty(
        "--request-card-media-offset",
        `${offset.toFixed(2)}px`,
      );
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
    };
  }, []);

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * -18;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -8;
    event.currentTarget.style.setProperty(
      "--request-card-hover-x",
      `${x.toFixed(2)}px`,
    );
    event.currentTarget.style.setProperty(
      "--request-card-hover-y",
      `${y.toFixed(2)}px`,
    );
  };

  const handlePointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    event.currentTarget.style.removeProperty("--request-card-hover-x");
    event.currentTarget.style.removeProperty("--request-card-hover-y");
  };

  return (
    <div
      ref={ref}
      className={`request-card-parallax ${className ?? ""}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {children}
    </div>
  );
}
