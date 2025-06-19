import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Drawer } from "vaul";
import { Ad } from "~/components/Ad";
import { Coin } from "~/components/Coin";
import { QuizDrawer } from "~/components/QuizDrawer";
import Slider from "~/components/Slider";
import { useUser } from "~/hooks/useUser";
import { useTRPC } from "~/trpc/init/react";

interface Quiz {
  id: number;
  title: string;
  description: string | null;
  imageUrl: string | null;
  isPopular: boolean | null;
  isNew: boolean | null;
  maxScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  categories: Array<{
    id: number;
    quizId: number;
    name: string;
  }>;
}

interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code: string;
  is_premium?: boolean;
}

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  const { user } = useUser();
  const trpc = useTRPC();
  const [openQuizId, setOpenQuizId] = useState<number | null>(null);

  const { data: quizes, isLoading, error } = useQuery(trpc.quizzes.getAll.queryOptions());

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-black pb-32 text-white">
      <div className="pointer-events-none fixed inset-0 z-10">
        <img
          src="/telek.png"
          alt="Decorative overlay"
          className="h-full w-full object-cover opacity-35"
        />
      </div>
      <header className="mx-4 flex items-center justify-between py-5 text-white">
        <h1 className="text-2xl uppercase">NETQUIZE</h1>
        <div className="flex">
          <p className="mr-2">{user?.totalScore || 0}</p>
          <Coin />
        </div>
      </header>
      <Ad />
      <main className="mx-4 flex flex-col">
        <Slider quizes={quizes || []} />
        <section className="my-4">
          <div className="flex justify-between">
            <h1 className="text-2xl uppercase">Квизы</h1>
            <div className="flex items-center justify-between">
              <p
                className="text-md mr-2 cursor-pointer uppercase"
                onClick={() => navigate({ to: "/quizzes" })}
              >
                Все
              </p>
              <svg
                width="12"
                height="21"
                viewBox="0 0 12 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 9.5V8.5H10V7.5H8V5.5H6V3.5H4V1.5H2V0.5H0V3.5H2V5.5H4V7.5H6V9.5H8V11.5H6V13.5H4V15.5H2V17.5H0V20.5H2V19.5H4V17.5H6V16.5V15.5H8V14.5V13.5H10V12.5H11V11.5H12V10.5V9.5H11Z"
                  fill="#EDEDED"
                />
              </svg>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-5">
            {quizes?.map((quiz) => (
              <Drawer.Root
                noBodyStyles
                key={quiz.id}
                open={openQuizId === quiz.id}
                onOpenChange={(open) => setOpenQuizId(open ? quiz.id : null)}
              >
                <Drawer.Trigger asChild>
                  <div className="cursor-pointer">
                    <div
                      style={{
                        borderTop: "4px solid white",
                        borderLeft: "4px solid white",
                        borderRight: "4px solid #293133",
                        borderBottom: "4px solid #293133",
                      }}
                      className="relative h-54 w-full"
                    >
                      <div className="flex max-h-6 w-full items-center bg-[#010089]">
                        <p className="px-2 py-2 text-xs uppercase">
                          {quiz.categories.length > 0
                            ? quiz.categories[0].name.substring(0, 18)
                            : ""}
                        </p>
                      </div>
                      <img
                        className="h-46 w-full object-cover"
                        src={quiz.imageUrl || "/placeholder.png"}
                        alt={quiz.title}
                        width={1000}
                        height={100}
                      />
                      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.8),transparent)]" />
                      <div className="absolute bottom-2 left-2">
                        {quiz.isNew && (
                          <h3 className="text-md font-medium text-[#F97316] uppercase">
                            Новинка
                          </h3>
                        )}
                        <h3 className="text-md mt-1 w-40 break-words uppercase">
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
                      <QuizDrawer quizId={quiz.id} />
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
