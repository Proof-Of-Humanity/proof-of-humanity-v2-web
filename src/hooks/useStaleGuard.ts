import { useCallback, useEffect, useRef } from "react";

/**
 * Guards multi-step async flows against applying results the user has since
 * discarded (retake, cancel) or that outlived the component.
 *
 * `begin()` marks the start of a run and returns that run's `isStale` check;
 * `invalidate()` abandons every run currently in flight. Beginning a new run
 * implicitly abandons older ones, and unmount invalidates automatically, so
 * callers never need to re-arm anything.
 *
 *   const staleGuard = useStaleGuard();
 *
 *   const process = async (input: Blob) => {
 *     const isStale = staleGuard.begin();
 *     const result = await expensiveWork(input);
 *     if (isStale()) return; // user discarded this run mid-flight
 *     commit(result);
 *   };
 *
 *   const discard = () => staleGuard.invalidate();
 */
export default function useStaleGuard() {
  const generation = useRef(0);

  const begin = useCallback(() => {
    const runGeneration = ++generation.current;
    return () => generation.current !== runGeneration;
  }, []);

  const invalidate = useCallback(() => {
    generation.current += 1;
  }, []);

  // Results must never be committed to an unmounted tree.
  useEffect(() => invalidate, [invalidate]);

  return { begin, invalidate };
}
