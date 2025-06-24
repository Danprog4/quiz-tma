import { useQueryClient } from "@tanstack/react-query";
import { openTelegramLink } from "@telegram-apps/sdk";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useSnapshot } from "valtio";
import { setIsSubscribed, store } from "~/store";
import { useTRPC } from "~/trpc/init/react";
import { Heart } from "./Icons/Heart";

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
    console.log("handleSubscribe");
    if (openTelegramLink) {
      console.log("openTelegramLink");
      openTelegramLink(`https://t.me/netizen_netizen`);
      setIsSubscribed(true);
      queryClient.setQueryData(trpc.main.getUser.queryKey(), (old: any) => ({
        ...old,
        isMember: true,
      }));
    }
  };

  return (
    <AnimatePresence mode="wait">
      {!isSubscribed && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{
            opacity: 0,
            scale: 0.8,
            y: -50,
            transition: { duration: 0.3, ease: "easeInOut" },
          }}
          transition={{
            duration: 0.5,
            ease: [0.175, 0.885, 0.32, 1.275],
            scale: {
              type: "spring",
              stiffness: 300,
              damping: 20,
              restDelta: 0.001,
            },
          }}
          className="fixed inset-0 z-[100000] flex h-screen w-full flex-col items-center justify-center gap-4 overflow-hidden bg-black/50 px-4 pb-10"
        >
          {/* Close Button */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.3, ease: "easeOut" }}
            className="flex w-full justify-end"
          >
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
          </motion.div>

          {/* Main Ad Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              delay: 0.2,
              duration: 0.4,
              ease: "easeOut",
            }}
            className="flex w-full items-center justify-center gap-2.5 rounded-none border-2 border-black bg-[#C0C0C0] p-3"
          >
            <div className="flex w-67 flex-col items-center gap-3">
              {/* Text and Content */}
              <div className="flex w-full flex-col items-center gap-6">
                {/* Main Text */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.3, ease: "easeOut" }}
                  className="flex w-full flex-col items-center gap-2"
                >
                  <p className="w-66 text-center text-lg leading-[1.4] font-normal text-black">
                    если что, в НЭТИЗАНЕ есть много крутого контента и мы были бы рады
                    твоей подписке :)
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5, duration: 0.3, ease: "easeOut" }}
                  className="flex items-center gap-6"
                >
                  {[1, 2, 3].map((index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.6 + index * 0.1,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="relative h-9 w-10"
                    >
                      <Heart />
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.3, ease: "easeOut" }}
                className="relative flex h-12 w-28 justify-center"
              >
                <p className="text-center text-[44px] leading-[1.05] font-normal text-white drop-shadow-[0_0_120px_rgba(224,224,224,0.6)]">
                  NETIZEN
                </p>
              </motion.div>

              {/* Buttons */}
              <div className="flex w-full flex-col items-center gap-3">
                {/* Subscribe Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.3, ease: "easeOut" }}
                  className="flex w-full flex-col items-center gap-4"
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                      onClick={() => handleSubscribe()}
                    >
                      Подписаться
                    </span>
                  </motion.button>
                </motion.div>

                {/* Decline Button */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9, duration: 0.3, ease: "easeOut" }}
                  className="flex w-full flex-col items-center gap-4"
                >
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
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
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
