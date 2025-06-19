import { useQueryClient } from "@tanstack/react-query";
import { openTelegramLink } from "@telegram-apps/sdk";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { setIsSubscribed, store } from "~/store";
import { useTRPC } from "~/trpc/init/react";

export const Ad = () => {
  const { isSubscribed } = useSnapshot(store);
  const channelName = import.meta.env.VITE_CHANNEL_URL;
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isSubscribed) {
      // Scroll page to top and disable scrolling when modal is open
      window.scrollTo(0, 0);
      document.body.style.overflow = "hidden";
    } else {
      // Restore scrolling when modal is closed
      document.body.style.overflow = "";
    }

    // Cleanup function to restore scrolling if component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [isSubscribed]);

  const handleSubscribe = () => {
    openTelegramLink(`https://t.me/@netizen_netizen`);
    setIsSubscribed(true);
    queryClient.setQueryData(trpc.main.getUser.queryKey(), (old: any) => ({
      ...old,
      isMember: true,
    }));
  };
  if (!isSubscribed) return null;

  return (
    <div className="fixed inset-0 z-[100000] flex h-screen w-full flex-col items-center justify-center gap-4 overflow-hidden bg-black/50 px-4 pb-10">
      {/* Close Button */}
      <div className="flex w-full justify-end">
        <button
          onClick={() => setIsSubscribed(true)}
          className="flex h-6 w-6 items-center justify-center"
        >
          <svg
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
        </button>
      </div>

      {/* Main Ad Content */}
      <div className="flex w-full items-center justify-center gap-2.5 rounded-none border-2 border-black bg-[#C0C0C0] p-3">
        <div className="flex w-67 flex-col items-center gap-3">
          {/* Text and Content */}
          <div className="flex w-full flex-col items-center gap-6">
            {/* Main Text */}
            <div className="flex w-full flex-col items-center gap-2">
              <p className="w-66 text-center text-lg leading-[1.4] font-normal text-black">
                если что, в НЭТИЗАНЕ есть много крутого контента и мы были бы рады твоей
                подписке :)
              </p>
            </div>

            {/* Heart Icons */}
            <div className="flex items-center gap-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="relative h-9 w-10">
                  <svg
                    width="40.5"
                    height="34.34"
                    viewBox="0 0 40.5 34.34"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M0 0H40.5V34.34H0V0Z" fill="#D82E2E" />
                    <circle cx="35.59" cy="9.51" r="2.41" fill="white" />
                  </svg>
                </div>
              ))}
            </div>
          </div>

          {/* Logo */}
          <div className="relative flex h-12 w-28 justify-center">
            <p className="text-center text-[44px] leading-[1.05] font-normal text-white drop-shadow-[0_0_120px_rgba(224,224,224,0.6)]">
              NETIZEN
            </p>
          </div>

          {/* Buttons */}
          <div className="flex w-full flex-col items-center gap-3">
            {/* Subscribe Button */}
            <div className="flex w-full flex-col items-center gap-4">
              <button
                className="flex w-full items-center justify-center gap-2.5 bg-[#0100BE] px-24 py-3 shadow-[inset_0_4px_4px_rgba(99,99,99,0.25)]"
                style={{
                  borderTop: "3.5px solid white",
                  borderLeft: "3.5px solid white",
                  borderRight: "3.5px solid #293133",
                  borderBottom: "3.5px solid #293133",
                }}
              >
                <span
                  className="text-center text-base leading-[1.05] font-normal text-white"
                  onClick={() => handleSubscribe}
                >
                  Подписаться
                </span>
              </button>
            </div>

            {/* Decline Button */}
            <div className="flex w-full flex-col items-center gap-4">
              <button
                onClick={() => setIsSubscribed(true)}
                className="flex w-full items-center justify-center gap-2.5 bg-[#AAAAAA] px-24 py-3 shadow-[inset_0_4px_4px_rgba(99,99,99,0.25)]"
                style={{
                  borderTop: "3.5px solid white",
                  borderLeft: "3.5px solid white",
                  borderRight: "3.5px solid #293133",
                  borderBottom: "3.5px solid #293133",
                }}
              >
                <span className="text-center text-base leading-[1.05] font-normal text-nowrap text-white">
                  вы не очень :(
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
