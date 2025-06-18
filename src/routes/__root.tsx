import { useQueryClient, type QueryClient } from "@tanstack/react-query";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { backButton, init, mockTelegramEnv, swipeBehavior } from "@telegram-apps/sdk";
import { TRPCOptionsProxy } from "@trpc/tanstack-react-query";
import { useEffect } from "react";
import { Drawer } from "vaul";
import { AuthProvider } from "~/components/AuthProvider";
import { Navbar } from "~/components/Navbar";

import appCss from "~/lib/styles/app.css?url";
import { useTRPC } from "~/trpc/init/react";
import { TRPCRouter } from "~/trpc/init/router";
declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        enableClosingConfirmation: () => void;
        expand: () => void;
        disableVerticalSwipes: () => void;
        requestFullscreen: () => void;
        lockOrientation: () => void;
        platform: string;
        version: string;
        // Add other Telegram WebApp properties you might use here
      };
    };
  }
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  trpc: TRPCOptionsProxy<TRPCRouter>;
}>()({
  ssr: false,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1",
      },
      {
        title: "React TanStarter",
      },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
});

function RootComponent() {
  useEffect(() => {
    const themeParams = {
      accent_text_color: "#6ab2f2",
      bg_color: "#17212b",
      button_color: "#5288c1",
      button_text_color: "#ffffff",
      destructive_text_color: "#ec3942",
      header_bg_color: "#17212b",
      hint_color: "#708499",
      link_color: "#6ab3f3",
      secondary_bg_color: "#232e3c",
      section_bg_color: "#17212b",
      section_header_text_color: "#6ab3f3",
      subtitle_text_color: "#708499",
      text_color: "#f5f5f5",
    } as const;

    if (import.meta.env.DEV) {
      mockTelegramEnv({
        launchParams: {
          tgWebAppPlatform: "web",
          tgWebAppVersion: "8.0.0",
          tgWebAppData: import.meta.env.VITE_MOCK_INIT_DATA,
          tgWebAppThemeParams: themeParams,
          tgWebAppStartParam: "ref=3",
        },
      });
    }

    init();

    backButton.mount();

    if (swipeBehavior.mount.isAvailable()) {
      swipeBehavior.mount();
      swipeBehavior.isMounted();
      swipeBehavior.disableVertical();
      swipeBehavior.isVerticalEnabled();
    }

    // if (viewport.expand.isAvailable()) {
    //   viewport.expand();
    // }

    // if (requestFullscreen.isAvailable()) {
    //   requestFullscreen();
    // }

    // viewport.mount().then(() => viewport.requestFullscreen());
  }, []);

  return (
    <RootDocument>
      <AuthProvider>
        <Outlet />
        <Navbar />
        <Drawer.Root noBodyStyles>
          <Drawer.Trigger asChild>
            <button className="fixed right-4 bottom-4 z-50 h-12 w-12 rounded-full bg-blue-500 text-white shadow-lg">
              +
            </button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50" />
            <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 mt-24 flex h-[96%] flex-col rounded-t-[10px] bg-[#212121] pb-[env(safe-area-inset-bottom)]">
              <div className="flex items-center justify-between px-4 pt-4">
                <Drawer.Close asChild>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="cursor-pointer"
                  >
                    <path
                      d="M7 19H5V17H7V19ZM19 19H17V17H19V19ZM9 15V17H7V15H9ZM17 17H15V15H17V17ZM11 15H9V13H11V15ZM15 15H13V13H15V15ZM13 13H11V11H13V13ZM11 11H9V9H11V11ZM15 11H13V9H15V11ZM9 9H7V7H9V9ZM17 9H15V7H17V9ZM7 7H5V5H7V7ZM19 7H17V5H19V7Z"
                      fill="white"
                    />
                  </svg>
                </Drawer.Close>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {/* Empty drawer content */}
              </div>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      </AuthProvider>
    </RootDocument>
  );
}

const isDev = import.meta.env.DEV;
const isErudaEnabled = import.meta.env.VITE_ERUDA_ENABLED === "true";

function RootDocument({ children }: { readonly children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const trpc = useTRPC();

  useEffect(() => {
    if (isDev && isErudaEnabled) {
      import("eruda").then((eruda) => {
        eruda.default.init();
      });
    }
  }, []);

  return (
    // suppress since we're updating the "dark" class in a custom script below
    <html suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}

        <Scripts />
      </body>
    </html>
  );
}
