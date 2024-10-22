import { RefObject, useEffect, useState } from "react";
import screenfull from "screenfull";

export interface FullScreenOptions {
  video?: RefObject<
    HTMLVideoElement & {
      webkitEnterFullscreen?: () => void;
      webkitExitFullscreen?: () => void;
    }
  >;
  onClose?: (error?: Error) => void;
}

const useFullscreen = (ref: RefObject<Element>) => {
  const [isFullscreen, setIsFullscreen] = useState(
    !!((document as any).webkitIsFullscreen || (document as any).mozFullScreen),
  );

  useEffect(() => {
    if (!isFullscreen || !ref.current) return;

    const onChange = () => {
      if (screenfull.isEnabled) setIsFullscreen(screenfull.isFullscreen);
    };

    if (screenfull.isEnabled) {
      try {
        screenfull.request(ref.current);
        setIsFullscreen(true);
      } catch (error: any) {
        setIsFullscreen(false);
      }
      screenfull.on("change", onChange);
    } else setIsFullscreen(false);

    return () => {
      setIsFullscreen(false);
      if (screenfull.isEnabled) {
        try {
          screenfull.off("change", onChange);
          screenfull.exit();
        } catch {}
      }
    };
  }, [isFullscreen, ref]);

  return {
    isFullscreen,
    setFullscreen: setIsFullscreen,
    toggleFullscreen: () => setIsFullscreen((o) => !o),
  };
};

export default useFullscreen;
