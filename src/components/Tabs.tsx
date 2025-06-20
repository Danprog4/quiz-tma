import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useSnapshot } from "valtio";
import { Drawer } from "vaul";
import { Coin } from "~/components/Coin";
import { QuizDrawer } from "~/components/QuizDrawer";
import { useUser } from "~/hooks/useUser";
import { setIsSubscribed, setOpenQuizId, setShowWarning, store } from "~/store";
import { useTRPC } from "~/trpc/init/react";
import { Complete } from "./Icons/Complete";
import { Warning } from "./Warning";

// Типы на основе нашей схемы БД
type Quiz = {
  id: number;
  title: string;
  imageUrl: string | null;
  isNew: boolean | null;
  categories: { name: string }[];
};

export default function Tabs() {
  const { openQuizId } = useSnapshot(store);
  const [activeTab, setActiveTab] = useState("all"); // 'all' или название категории
  const { user } = useUser();

  // Используем tRPC для получения квизов
  const trpc = useTRPC();
  const { data: quizes = [], isLoading: loading } = useQuery(
    trpc.quizzes.getAll.queryOptions(),
  );
  const { data: userQuizCoins = [] } = useQuery(trpc.main.getUserResults.queryOptions());

  // Получаем уникальные категории из всех квизов (без учета регистра)
  const categories = useMemo(() => {
    const allCategories = quizes.flatMap(
      (quiz) => quiz.categories?.map((c: { name: string }) => c.name.toLowerCase()) || [],
    );

    // Удаляем дубликаты, сохраняем оригинальные названия и сортируем
    const uniqueCategories = new Map<string, string>();
    quizes.forEach((quiz) => {
      quiz.categories?.forEach((cat: { name: string }) => {
        const lowerName = cat.name.toLowerCase();
        if (!uniqueCategories.has(lowerName)) {
          // Сохраняем оригинальное название (первое встретившееся)
          uniqueCategories.set(lowerName, cat.name);
        }
      });
    });

    return Array.from(uniqueCategories.values()).sort();
  }, [quizes]);

  // Фильтруем квизы по активной вкладке (без учета регистра)
  const filteredQuizes = useMemo(() => {
    if (activeTab === "all") return quizes;
    return quizes.filter((quiz) =>
      quiz.categories?.some(
        (cat: { name: string }) => cat.name.toLowerCase() === activeTab.toLowerCase(),
      ),
    );
  }, [quizes, activeTab]);

  if (loading) {
    return <div className="py-4 text-white">Загрузка...</div>;
  }

  return (
    <div className="">
      <div className="flex overflow-x-auto border-b border-gray-200">
        {/* Вкладка "Все" */}
        <button
          onClick={() => setActiveTab("all")}
          className={`cursor-pointer px-4 py-2 text-sm font-medium whitespace-nowrap focus:outline-none ${
            activeTab === "all"
              ? "border-b-2 border-[#6CED52] text-[#6CED52]"
              : "text-white hover:text-gray-200"
          }`}
        >
          Все
        </button>

        {/* Вкладки категорий */}
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveTab(category)}
            className={`cursor-pointer px-4 py-2 text-sm font-medium whitespace-nowrap focus:outline-none ${
              activeTab.toLowerCase() === category.toLowerCase()
                ? "border-b-2 border-[#6CED52] text-[#6CED52]"
                : "text-white hover:text-gray-200"
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="my-4 grid grid-cols-2 gap-4">
        {filteredQuizes.length > 0 ? (
          filteredQuizes.map((quiz, index) => {
            const quizResult = userQuizCoins?.find((result) => result.quizId === quiz.id);

            return (
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
                      {quizResult?.correctAnswers && quizResult?.correctAnswers > 0 ? (
                        <div className="absolute top-1/2 left-1/2 flex min-h-[85px] min-w-[85px] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center gap-1 bg-[#28282899] p-4">
                          <div className="flex items-center justify-center bg-[#25CE16] p-2">
                            <Complete />
                          </div>

                          <div>Пройдено</div>
                          {`${quizResult.correctAnswers}/${quiz.questions.length}`}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </Drawer.Trigger>
                <Drawer.Portal>
                  <Drawer.Overlay className="fixed inset-0 z-40 bg-black/50" />
                  <Drawer.Content className="fixed right-0 bottom-0 left-0 z-50 mt-24 flex h-screen flex-col rounded-t-[10px] bg-[#212121]">
                    <div className="flex items-center justify-between px-4 pt-5">
                      <svg
                        onClick={() => setShowWarning(true)}
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
                      <Warning
                        onConfirm={() => setOpenQuizId(null)}
                        onCancel={() => {}}
                      />
                      <div className="flex items-center gap-2">
                        <Coin />
                        {user?.totalScore}
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      <QuizDrawer
                        quizId={quiz.id}
                        onClose={() => {
                          setOpenQuizId(null);
                          if (!user?.isMember) {
                            setIsSubscribed(false);
                            console.log("setIsSubscribed(false)");
                          }
                        }}
                      />
                    </div>
                  </Drawer.Content>
                </Drawer.Portal>
              </Drawer.Root>
            );
          })
        ) : (
          <div className="col-span-2 py-8 text-center text-white">
            Нет квизов в этой категории
          </div>
        )}
      </div>
    </div>
  );
}
