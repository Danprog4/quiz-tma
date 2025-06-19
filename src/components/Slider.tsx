import { useEffect, useRef, useState } from "react";
import { Drawer } from "vaul";
import { Coin } from "~/components/Coin";
import { QuizDrawer } from "~/components/QuizDrawer";
import { useUser } from "~/hooks/useUser";

export default function QuizSlider({ quizes }: { quizes: any[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [openQuizId, setOpenQuizId] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const { user } = useUser();

  const visibleQuizes = quizes.slice(-3);

  // Auto-slide functionality
  useEffect(() => {
    if (visibleQuizes.length <= 1 || isDragging) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === visibleQuizes.length - 1 ? 0 : prevIndex + 1,
      );
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(interval);
  }, [visibleQuizes.length, isDragging]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    setTranslateX(diffX);
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50;
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (translateX < 0 && currentIndex < visibleQuizes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }

    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const currentX = e.clientX;
    const diffX = currentX - startX;
    setTranslateX(diffX);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 50;
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      } else if (translateX < 0 && currentIndex < visibleQuizes.length - 1) {
        setCurrentIndex(currentIndex + 1);
      }
    }

    setTranslateX(0);
  };

  return (
    <div className="relative w-full overflow-x-hidden py-4">
      <div
        ref={containerRef}
        className="relative mx-auto h-96 w-full select-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {visibleQuizes.map((quiz, index) => {
          const isActive = index === currentIndex;
          const baseTransform = isActive
            ? "0px"
            : index > currentIndex
              ? "calc(100% + 20px)"
              : "calc(-100% - 20px)";

          return (
            <Drawer.Root
              key={quiz.id}
              open={openQuizId === quiz.id}
              onOpenChange={(open) => setOpenQuizId(open ? quiz.id : null)}
            >
              <Drawer.Trigger asChild>
                <div
                  className={`absolute top-0 left-0 h-full w-full cursor-pointer transition-all duration-500 ease-in-out ${
                    isActive ? "z-10" : "z-0"
                  }`}
                  style={{
                    transform: `translateX(calc(${baseTransform} + ${isDragging && isActive ? translateX : 0}px)) scale(${isActive ? 1 : 0.9})`,
                    opacity: isActive ? 1 : 0.7,
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
                        src={quiz.image_url || "/testimg.png"}
                        alt={quiz.title}
                        width={1000}
                        height={1000}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.8),transparent)]" />
                    </div>
                    <div className="absolute bottom-4 left-4 z-10">
                      {quiz.is_new && (
                        <h3 className="text-md text-[#F97316] uppercase">Новинка</h3>
                      )}
                      <h3 className="broken w-64 text-xl break-words uppercase">
                        {quiz.title}
                      </h3>
                    </div>
                  </div>
                </div>
              </Drawer.Trigger>
              <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50" />
                <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-[#212121]">
                  <div className="flex items-center justify-between px-4 pt-4">
                    <svg
                      onClick={() => setOpenQuizId(null)}
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7 19H5V17H7V19ZM19 19H17V17H19V19ZM9 15V17H7V15H9ZM17 17H15V15H17V17ZM11 15H9V13H11V15ZM15 15H13V13H15V15ZM13 13H11V11H13V13ZM11 11H9V9H11V11ZM15 11H13V9H15V11ZM9 9H7V7H9V9ZM17 9H15V7H17V9ZM7 7H5V5H7V7ZM19 7H17V5H19V7Z"
                        fill="white"
                      />
                    </svg>
                    <div className="flex items-center gap-2">
                      <Coin />
                      {user?.totalScore}
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <QuizDrawer quizId={quiz.id} onClose={() => setOpenQuizId(null)} />
                  </div>
                </Drawer.Content>
              </Drawer.Portal>
            </Drawer.Root>
          );
        })}
      </div>

      {/* Индикаторы */}
      <div className="flex justify-center space-x-2">
        {visibleQuizes.map((_, index) => (
          <div
            key={index}
            className={`h-2 w-2 cursor-pointer rounded-full transition-all duration-300 ${
              index === currentIndex ? "w-6 bg-white" : "bg-gray-500"
            }`}
            onClick={() => setCurrentIndex(index)}
          />
        ))}
      </div>
    </div>
  );
}
