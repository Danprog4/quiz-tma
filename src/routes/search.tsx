import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Drawer } from "vaul";
import { Coin } from "~/components/Coin";
import { QuizDrawer } from "~/components/QuizDrawer";
import { useUser } from "~/hooks/useUser";
import { useTRPC } from "~/trpc/init/react";
import { Navbar } from "../components/Navbar";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const { user } = useUser();
  const [search, setSearch] = useState("");
  const [openQuizId, setOpenQuizId] = useState<number | null>(null);
  const { data: quizes } = useQuery(trpc.quizzes.getAll.queryOptions());

  return (
    <div className="relative min-h-screen w-screen overflow-x-hidden bg-black px-4 pb-16 text-white">
      {/* Header */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <img
          src="/telek.png"
          alt="Decorative overlay"
          className="h-full w-full object-cover opacity-35"
        />
      </div>
      <div className="flex items-center justify-between border-b border-[#424242] py-2 pt-[40px]">
        <input
          type="text"
          className="w-full appearance-none border-none bg-transparent text-lg font-normal outline-none placeholder:text-white focus:border-none focus:ring-0 focus:outline-none"
          placeholder="Название квиза"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="h-5 w-5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.25 4.5V3.75H13.5V3H12.75V2.25H5.25V3H4.5V3.75H3.75V4.5H3V12H3.75V12.75H4.5V13.5H5.25V14.25H11.25V15.75H12V16.5H14.25V15H13.5V14.25H12.75V13.5H13.5V12.75H14.25V12H15V4.5H14.25ZM13.5 10.5H12.75V11.25H12V12H11.25V12.75H6.75V12H6V11.25H5.25V10.5H4.5V6H5.25V5.25H6V4.5H6.75V3.75H11.25V4.5H12V5.25H12.75V6H13.5V10.5Z"
              fill="#6CED52"
            />
          </svg>
        </div>
      </div>

      {/* Search Results */}
      <div className="pt-6 pb-20">
        <div className="mb-4">
          <h2 className="text-2xl font-normal text-white">найдено</h2>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-4">
          {quizes
            ?.filter(
              (quiz) =>
                quiz.title.toLowerCase().includes(search.toLowerCase()) ||
                quiz.collaboratorName?.toLowerCase().includes(search.toLowerCase()),
            )
            .map((quiz) => (
              <Drawer.Root
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
                      <QuizDrawer quizId={quiz.id} onClose={() => setOpenQuizId(null)} />
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            ))}
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="fixed top-1/2 right-1 -translate-y-1/2 transform">
        <div className="h-24 w-1 rounded-l-full bg-[#383838]"></div>
      </div>

      {/* Background Texture */}
      <div className="pointer-events-none fixed inset-0 z-0 opacity-60">
        <div className="h-full w-full bg-[url('/texture.jpg')] bg-cover bg-center opacity-60"></div>
      </div>

      <Navbar />
    </div>
  );
}
