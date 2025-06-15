import { useRef, useState } from "react";

export const CustomVideoPlayer = ({ src }: { src: string }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  return (
    <div className="relative w-full max-h-60">
      <video
        ref={videoRef}
        src={src}
        className="w-full max-h-60 object-cover"
        onClick={togglePlay}
      />
      
      <button
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition"
      >
        {!isPlaying ? (
            <svg width="45" height="45" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.0013 10.6667V9.33333H16.668V8H14.0013V5.33333H11.3346V2.66667H8.66797V0H0.667969V24H8.66797V22.6667V21.3333H11.3346V18.6667H14.0013V16H16.668V14.6667H18.0013V13.3333H19.3346V10.6667H18.0013ZM11.3346 13.3333V16H8.66797V18.6667H6.0013V21.3333H3.33464V2.66667H6.0013V5.33333H8.66797V8H11.3346V10.6667H14.0013V13.3333H11.3346Z" fill="white"/>
            </svg>
        ) : (
            <svg width="45" height="45" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7.33398 21.666H0.667969V0.332031H7.33398V21.666ZM19.334 21.666H12.668V0.332031H19.334V21.666Z" fill="white"/>
            </svg>
        )}
      </button>
    </div>
  );
};