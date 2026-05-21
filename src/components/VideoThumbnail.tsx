import { twMerge } from "tailwind-merge";

interface VideoThumbnailProps {
  src: string;
  className?: string;
}

export default function VideoThumbnail({
  src,
  className,
}: VideoThumbnailProps) {
  // Append #t=0.001 to force iOS Safari to render first frame
  const videoSrc = src.includes("#") ? src : `${src}#t=0.001`;

  return (
    <video
      className={twMerge(
        "aspect-video w-full bg-black object-contain",
        className,
      )}
      src={videoSrc}
      preload="metadata"
      playsInline
    />
  );
}
