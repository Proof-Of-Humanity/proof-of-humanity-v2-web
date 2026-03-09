interface VideoThumbnailProps {
  src: string;
  className?: string;
}

export default function VideoThumbnail({ src, className }: VideoThumbnailProps) {
  // Append #t=0.001 to force iOS Safari to render first frame
  const videoSrc = src.includes('#') ? src : `${src}#t=0.001`;

  return (
    <video
      className={className}
      src={videoSrc}
      preload="metadata"
      playsInline
    />
  );
}
