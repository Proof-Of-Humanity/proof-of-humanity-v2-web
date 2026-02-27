"use client";

import { useEffect, useState } from "react";
import { IS_MOBILE } from "utils/media";

function generateVideoThumbnail(videoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = videoUrl;

    video.onloadeddata = () => {
      video.currentTime = 0.001;
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) { reject(new Error("No canvas context")); return; }
      ctx.drawImage(video, 0, 0);
      resolve(canvas.toDataURL("image/jpeg", 0.8));
    };

    video.onerror = () => reject(new Error("Video load error"));
  });
}

interface VideoThumbnailProps {
  src: string;
  className?: string;
}

export default function VideoThumbnail({ src, className }: VideoThumbnailProps) {
  const [poster, setPoster] = useState<string | undefined>();

  useEffect(() => {
    if (!IS_MOBILE) return;
    generateVideoThumbnail(src)
      .then(setPoster)
      .catch(() => {});
  }, [src]);

  return (
    <video
      className={className}
      src={src}
      poster={poster}
      preload="metadata"
      playsInline
    />
  );
}
