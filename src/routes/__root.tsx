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
        <Drawer.Root>
          <Drawer.Trigger asChild>
            <div className="fixed right-4 bottom-4 z-50 h-12 w-12 rounded-full bg-blue-500 text-white shadow-lg">
              +
            </div>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Overlay className="fixed inset-0 bg-black/40" />
            <Drawer.Content className="pt fixed right-0 bottom-0 left-0 z-[1000] flex flex-col rounded-t-[10px]">
              <div className="flex-1 rounded-t-[10px] bg-neutral-900 pt-2 pr-4 pb-7 pl-4">
                <div className="mx-auto mb-8 h-1.5 w-12 flex-shrink-0 rounded-full bg-neutral-600" />
                <div className="mx-auto">
                  <div className="space-y-4">
                    <div className="rounded-lg bg-gradient-to-r from-neutral-800 to-neutral-900 p-4">
                      <h3 className="mb-2 font-medium text-white">Без ограничений</h3>
                      <p className="text-sm text-neutral-400">
                        Создавай и выполняй любое количество своих или готовых заданий
                      </p>
                    </div>
                    <div className="rounded-lg bg-gradient-to-r from-neutral-800 to-neutral-900 p-4">
                      <h3 className="mb-2 font-medium text-white">Больше токенов</h3>
                      <p className="text-sm text-neutral-400">
                        Получай в два раза больше токенов за пройденные дни и продлевай за
                        них свой премиум
                      </p>
                    </div>
                  </div>
                </div>
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
