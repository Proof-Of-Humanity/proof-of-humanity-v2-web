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

  const toggleFullscreen = () => {
    const target = ref.current as
      | (Element & {
          webkitRequestFullscreen?: () => Promise<void> | void;
          querySelector?: (selectors: string) => Element | null;
        })
      | null;

    if (!target) return;

    if (screenfull.isEnabled) {
      setIsFullscreen((open) => !open);
      return;
    }

    const video = target.querySelector?.("video") as
      | (HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
          webkitRequestFullscreen?: () => Promise<void> | void;
        })
      | null;

    const requestFullscreen =
      target.requestFullscreen?.bind(target) ??
      target.webkitRequestFullscreen?.bind(target) ??
      video?.requestFullscreen?.bind(video) ??
      video?.webkitRequestFullscreen?.bind(video);

    if (requestFullscreen) {
      Promise.resolve(requestFullscreen()).catch(() => {
        setIsFullscreen(false);
      });
      return;
    }

    if (video?.webkitEnterFullscreen) {
      try {
        video.webkitEnterFullscreen();
      } catch {
        setIsFullscreen(false);
      }
    }
  };

  return {
    isFullscreen,
    setFullscreen: setIsFullscreen,
    toggleFullscreen,
  };
};

export default useFullscreen;
