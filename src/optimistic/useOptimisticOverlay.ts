"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseOptimisticOverlayOptions<Base, Overlay> {
  base: Base;
  enablePolling: boolean;
  ttlMs: number;
  refreshIntervalMs: number;
  refreshOnClear?: boolean;
  isOverlayEmpty: (overlay: Overlay | null) => boolean;
  reconcileOverlay: (base: Base, overlay: Overlay | null) => Overlay | null;
  mergePatch: (current: Overlay | null, patch: Overlay) => Overlay | null;
}

export default function useOptimisticOverlay<Base, Overlay>({
  base,
  enablePolling,
  ttlMs,
  refreshIntervalMs,
  refreshOnClear = false,
  isOverlayEmpty,
  reconcileOverlay,
  mergePatch,
}: UseOptimisticOverlayOptions<Base, Overlay>) {
  const router = useRouter();
  const [overlay, setOverlay] = useState<Overlay | null>(null);
  const hasOverlay = !isOverlayEmpty(overlay);
  const wasOverlayActiveRef = useRef(false);

  useEffect(() => {
    setOverlay((current) => reconcileOverlay(base, current));
  }, [base, reconcileOverlay]);

  useEffect(() => {
    if (!enablePolling) {
      wasOverlayActiveRef.current = hasOverlay;
      return;
    }

    if (refreshOnClear && wasOverlayActiveRef.current && !hasOverlay) {
      wasOverlayActiveRef.current = false;
      const timeoutId = window.setTimeout(() => {
        router.refresh();
      }, refreshIntervalMs);
      return () => window.clearTimeout(timeoutId);
    }

    wasOverlayActiveRef.current = hasOverlay;
    return;
  }, [enablePolling, hasOverlay, refreshIntervalMs, refreshOnClear, router]);

  useEffect(() => {
    if (!hasOverlay) return;

    const timeoutId = window.setTimeout(() => {
      setOverlay(null);
    }, ttlMs);

    return () => window.clearTimeout(timeoutId);
  }, [hasOverlay, ttlMs]);

  useEffect(() => {
    if (!enablePolling || !hasOverlay) return;

    const intervalId = window.setInterval(() => {
      router.refresh();
    }, refreshIntervalMs);

    return () => window.clearInterval(intervalId);
  }, [enablePolling, hasOverlay, refreshIntervalMs, router]);

  const applyPatch = useCallback((patch: Overlay) => {
    setOverlay((current) => mergePatch(current, patch));
  }, [mergePatch]);

  const clearOverlay = useCallback(() => {
    setOverlay(null);
  }, []);

  return {
    overlay,
    hasOverlay,
    applyPatch,
    clearOverlay,
  };
}
