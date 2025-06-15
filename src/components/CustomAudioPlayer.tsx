import { useRef, useState } from 'react';

const CustomAudioPlayer = ({ src }: { src: string }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.muted = !audio.muted;
    setIsMuted(audio.muted);
  };

  return (
    <div className="flex items-center justify-between w-full p-2 rounded-md">

      <button onClick={togglePlay} className="">
        {isPlaying ? (
          <svg width="30" height="30" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M7.33398 21.666H0.667969V0.332031H7.33398V21.666ZM19.334 21.666H12.668V0.332031H19.334V21.666Z" fill="white" />
          </svg>
        ) : (
          <svg width="30" height="30" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.0013 10.6667V9.33333H16.668V8H14.0013V5.33333H11.3346V2.66667H8.66797V0H0.667969V24H8.66797V22.6667V21.3333H11.3346V18.6667H14.0013V16H16.668V14.6667H18.0013V13.3333H19.3346V10.6667H18.0013ZM11.3346 13.3333V16H8.66797V18.6667H6.0013V21.3333H3.33464V2.66667H6.0013V5.33333H8.66797V8H11.3346V10.6667H14.0013V13.3333H11.3346Z" fill="white"/>
          </svg>
        )}
      </button>
      <div className=" mx-4 w-full">
        <svg width="100%" height="60" viewBox="0 0 164 35" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M80.93 3H85.07V5.45455H87.5V30.5455H85.07V33H80.93V30.5455H78.5V5.45455H80.93V3Z" fill="#6CED52"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M92.58 10H94.42V11.2273H95.5V23.7727H94.42V25H92.58V23.7727H91.5V11.2273H92.58V10Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M3.47 0H8.53V2.86364H11.5V32.1364H8.53V35H3.47V32.1364H0.5V2.86364H3.47V0Z" fill="#6CED52"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M16.85 9H19.15V10.3091H20.5V23.6909H19.15V25H16.85V23.6909H15.5V10.3091H16.85V9Z" fill="#6CED52"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M26.66 3H30.34V5.29091H32.5V28.7091H30.34V31H26.66V28.7091H24.5V5.29091H26.66V3Z" fill="#6CED52"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M38.58 11H40.42V12.0636H41.5V22.9364H40.42V24H38.58V22.9364H37.5V12.0636H38.58V11Z" fill="#6CED52"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M47.93 2H52.07V4.45455H54.5V29.5455H52.07V32H47.93V29.5455H45.5V4.45455H47.93V2Z" fill="#6CED52"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M60.39 6H63.61V7.88182H65.5V27.1182H63.61V29H60.39V27.1182H58.5V7.88182H60.39V6Z" fill="#6CED52"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M70.58 11H72.42V12.1455H73.5V23.8545H72.42V25H70.58V23.8545H69.5V12.1455H70.58V11Z" fill="#6CED52"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M92.58 10H94.42V11.2273H95.5V23.7727H94.42V25H92.58V23.7727H91.5V11.2273H92.58V10Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M161.34 3H157.66V5.29091H155.5V28.7091H157.66V31H161.34V28.7091H163.5V5.29091H161.34V3Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M149.42 11H147.58V12.0636H146.5V22.9364H147.58V24H149.42V22.9364H150.5V12.0636H149.42V11Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M140.07 2H135.93V4.45455H133.5V29.5455H135.93V32H140.07V29.5455H142.5V4.45455H140.07V2Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M127.61 6H124.39V7.8H122.5V26.2H124.39V28H127.61V26.2H129.5V7.8H127.61V6Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M117.42 10H115.58V11.1455H114.5V22.8545H115.58V24H117.42V22.8545H118.5V11.1455H117.42V10Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M108.07 2H103.93V4.45455H101.5V29.5455H103.93V32H108.07V29.5455H110.5V4.45455H108.07V2Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M161.34 3H157.66V5.29091H155.5V28.7091H157.66V31H161.34V28.7091H163.5V5.29091H161.34V3Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M149.42 11H147.58V12.0636H146.5V22.9364H147.58V24H149.42V22.9364H150.5V12.0636H149.42V11Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M140.07 2H135.93V4.45455H133.5V29.5455H135.93V32H140.07V29.5455H142.5V4.45455H140.07V2Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M127.61 6H124.39V7.8H122.5V26.2H124.39V28H127.61V26.2H129.5V7.8H127.61V6Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M117.42 10H115.58V11.1455H114.5V22.8545H115.58V24H117.42V22.8545H118.5V11.1455H117.42V10Z" fill="white"/>
            <path fill-rule="evenodd" clip-rule="evenodd" d="M108.07 2H103.93V4.45455H101.5V29.5455H103.93V32H108.07V29.5455H110.5V4.45455H108.07V2Z" fill="white"/>
        </svg>
      </div>

      <button onClick={toggleMute} className="">
            <svg width="45" height="45" viewBox="0 0 33 33" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21.8333 19.1667H23.1667V13.8333H21.8333V12.5H20.5V20.5H21.8333V19.1667Z" fill="white"/>
                <path d="M15.1667 4.5V5.83333H13.8333V7.16667H12.5V8.5H11.1667V9.83333H9.83333V11.1667H8.5V12.5H7.16667V13.8333H5.83333V15.1667H4.5V17.8333H5.83333V19.1667H7.16667V20.5H8.5V21.8333H9.83333V23.1667H11.1667V24.5H12.5V25.8333H13.8333V27.1667H15.1667V28.5H17.8333V4.5H15.1667ZM15.1667 21.8333H13.8333V20.5H12.5V19.1667H11.1667V17.8333H9.83333V15.1667H11.1667V13.8333H12.5V12.5H13.8333V11.1667H15.1667V21.8333Z" fill="white"/>
                <path d="M25.8333 9.83333V8.5H20.5V11.1667H23.1667V12.5H24.5V20.5H23.1667V21.8333H20.5V24.5H25.8333V23.1667H27.1667V9.83333H25.8333Z" fill="white"/>
            </svg>
      </button>


      <audio ref={audioRef} src={src} />
    </div>
  );
};

export default CustomAudioPlayer;
