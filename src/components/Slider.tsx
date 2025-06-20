import { useCallback, useEffect, useRef, useState } from "react";

export default function QuizSlider({ quizes }: { quizes: any }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>(null);

  const visibleQuizes = quizes.slice(-3);
  const totalSlides = visibleQuizes.length;

  const slides = [...visibleQuizes, ...visibleQuizes, ...visibleQuizes];
  const totalExtendedSlides = slides.length;

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [totalSlides]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsSwiping(true);
    setStartX(e.touches[0].clientX);
    setTranslateX(0);
    cancelAnimationFrame(animationRef.current!);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);

    if (translateX > 50) {
      goToPrev();
    } else if (translateX < -50) {
      goToNext();
    } else {
      setTranslateX(0);
    }
  };

  const getSlidePosition = (index: number) => {
    const position = (index - currentIndex + totalExtendedSlides) % totalExtendedSlides;
    return position;
  };

  useEffect(() => {
    if (!isSwiping) {
      setTranslateX(0);
    }
  }, [currentIndex, isSwiping]);

  return (
    <div className="relative w-full overflow-x-hidden py-4">
      <div
        className="relative mx-auto h-86 w-full"
        ref={sliderRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((quiz, index) => {
          const position = getSlidePosition(index);
          const isActive = position === totalSlides;
          const isNext = position === totalSlides + 1;
          const isPrev = position === totalSlides - 1;
          const isFar = !isActive && !isNext && !isPrev;

          return (
            <div
              key={`${quiz.id}-${index}`}
              className={`absolute top-0 left-0 h-full w-full transition-all duration-500 ease-in-out ${
                isActive ? "z-10" : "z-0"
              }`}
              style={{
                transform: `translateX(${
                  isActive
                    ? `${translateX}px`
                    : isNext
                      ? `calc(100% + 20px + ${translateX}px)`
                      : isPrev
                        ? `calc(-100% - 20px + ${translateX}px)`
                        : position < totalSlides
                          ? `calc(-200% - 40px + ${translateX}px)`
                          : `calc(200% + 40px + ${translateX}px)`
                }) scale(${isActive ? 1 : 0.9})`,
                opacity: isActive ? 1 : isNext || isPrev ? 0.7 : 0,
                pointerEvents: isActive ? "auto" : "none",
              }}
            >
              <div
                className="relative mx-auto h-86 w-full max-w-md overflow-hidden"
                style={{
                  borderTop: "6px solid white",
                  borderLeft: "6px solid white",
                  borderRight: "6px solid #293133",
                  borderBottom: "6px solid #293133",
                }}
              >
                <div className="flex h-8 w-full items-center justify-between bg-[#010089] px-1">
                  <p className="text-md px-1 uppercase">Музыка</p>
                  <svg
                    className=""
                    width="55"
                    height="20"
                    viewBox="0 0 45 14"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M45 14V0L31.2091 0V14H45Z" fill="#C0C0C0" />
                    <path
                      d="M44.2344 0.773686V13.1895L44.9965 14V0L44.2344 0.773686Z"
                      fill="#2A2927"
                    />
                    <path
                      d="M44.2344 0.770765V13.1866L44.6336 13.5918V0.402344L44.2344 0.770765Z"
                      fill="#4C4C4C"
                    />
                    <path
                      d="M44.2358 0.773686L44.9979 0H31.207L32.0054 0.773686H44.2358Z"
                      fill="#E6E6E6"
                    />
                    <path
                      d="M44.239 0.770765L44.6382 0.402344H31.6094L32.0086 0.770765H44.239Z"
                      fill="#F2F2F2"
                    />
                    <path
                      d="M32.0054 13.1895V0.773686L31.207 0V14L32.0054 13.1895Z"
                      fill="#E6E6E6"
                    />
                    <path
                      d="M32.0086 13.1866V0.770765L31.6094 0.402344V13.5918L32.0086 13.1866Z"
                      fill="#F2F2F2"
                    />
                    <path
                      d="M32.0054 13.1836L31.207 13.9941H44.9979L44.2358 13.1836H32.0054Z"
                      fill="#2A2927"
                    />
                    <path
                      d="M32.0086 13.1836L31.6094 13.5889H44.6382L44.239 13.1836H32.0086Z"
                      fill="#4C4C4C"
                    />
                    <path
                      d="M44.2343 0.773438H32.0039V13.1892H44.2343V0.773438Z"
                      fill="#C0C0C0"
                    />
                    <path
                      d="M41.3026 2.97517L34.1172 10.2695L34.8871 11.0511L42.0725 3.75671L41.3026 2.97517Z"
                      fill="#1D1D1B"
                    />
                    <path
                      d="M34.8871 2.98018L34.1172 3.76172L41.3026 11.0561L42.0725 10.2745L34.8871 2.98018Z"
                      fill="#1D1D1B"
                    />
                    <path d="M29.3945 14V0L15.6036 0V14H29.3945Z" fill="#C0C0C0" />
                    <path
                      d="M28.6328 0.773686V13.1895L29.3949 14V0L28.6328 0.773686Z"
                      fill="#2A2927"
                    />
                    <path
                      d="M28.6328 0.770765V13.1866L29.032 13.5918V0.402344L28.6328 0.770765Z"
                      fill="#4C4C4C"
                    />
                    <path
                      d="M28.6304 0.773686L29.3925 0H15.6016L16.4 0.773686H28.6304Z"
                      fill="#E6E6E6"
                    />
                    <path
                      d="M28.6374 0.770765L29.0366 0.402344H16.0078L16.407 0.770765H28.6374Z"
                      fill="#F2F2F2"
                    />
                    <path
                      d="M16.4 13.1895V0.773686L15.6016 0V14L16.4 13.1895Z"
                      fill="#E6E6E6"
                    />
                    <path
                      d="M16.407 13.1866V0.770765L16.0078 0.402344V13.5918L16.407 13.1866Z"
                      fill="#F2F2F2"
                    />
                    <path
                      d="M16.4 13.1836L15.6016 13.9941H29.3925L28.6304 13.1836H16.4Z"
                      fill="#2A2927"
                    />
                    <path
                      d="M16.407 13.1836L16.0078 13.5889H29.0366L28.6374 13.1836H16.407Z"
                      fill="#4C4C4C"
                    />
                    <path
                      d="M28.6327 0.773438H16.4023V13.1892H28.6327V0.773438Z"
                      fill="#C0C0C0"
                    />
                    <path
                      d="M26.6378 11.1969H18.3633V2.79688H26.6378V11.1969ZM19.452 10.0916H25.5491V3.90214H19.452V10.0916Z"
                      fill="#1D1D1B"
                    />
                    <path
                      d="M26.096 3.34766H18.9102V4.74765H26.096V3.34766Z"
                      fill="#1D1D1B"
                    />
                    <path d="M13.793 14V0L0.00205231 0V14H13.793Z" fill="#C0C0C0" />
                    <path
                      d="M13.0273 0.773686V13.1895L13.7895 14V0L13.0273 0.773686Z"
                      fill="#2A2927"
                    />
                    <path
                      d="M13.0273 0.770765V13.1866L13.4265 13.5918V0.402344L13.0273 0.770765Z"
                      fill="#4C4C4C"
                    />
                    <path
                      d="M13.0288 0.773686L13.7909 0H0L0.798404 0.773686H13.0288Z"
                      fill="#E6E6E6"
                    />
                    <path
                      d="M13.028 0.770765L13.4272 0.402344H0.398438L0.797639 0.770765H13.028Z"
                      fill="#F2F2F2"
                    />
                    <path
                      d="M0.798404 13.1895V0.773686L0 0V14L0.798404 13.1895Z"
                      fill="#E6E6E6"
                    />
                    <path
                      d="M0.797639 13.1866V0.770765L0.398438 0.402344V13.5918L0.797639 13.1866Z"
                      fill="#F2F2F2"
                    />
                    <path
                      d="M0.798404 13.1836L0 13.9941H13.7909L13.0288 13.1836H0.798404Z"
                      fill="#2A2927"
                    />
                    <path
                      d="M0.797639 13.1836L0.398438 13.5889H13.4272L13.028 13.1836H0.797639Z"
                      fill="#4C4C4C"
                    />
                    <path
                      d="M13.0234 0.773438H0.792969V13.1892H13.0234V0.773438Z"
                      fill="#C0C0C0"
                    />
                    <path
                      d="M9.51115 9.90625H4.28516V11.3799H9.51115V9.90625Z"
                      fill="#1D1D1B"
                    />
                  </svg>
                </div>
                <div className="relative h-86 w-full">
                  <img
                    className="h-86 w-full object-cover"
                    src={"/fallback.png"}
                    alt={quiz.text}
                    width={1000}
                    height={1000}
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.8),transparent)]" />
                </div>
                <div className="absolute bottom-4 left-4 z-10">
                  <h3 className="broken w-64 text-xl break-words uppercase">
                    {quiz.text}
                  </h3>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
