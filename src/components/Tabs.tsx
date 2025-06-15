import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useTRPC } from "~/trpc/init/react";

// Типы на основе нашей схемы БД
type Quiz = {
  id: number;
  title: string;
  imageUrl: string | null;
  isNew: boolean | null;
  categories: { name: string }[];
};

export default function Tabs() {
  const [activeTab, setActiveTab] = useState("all"); // 'all' или название категории

  // Используем tRPC для получения квизов
  const trpc = useTRPC();
  const { data: quizes = [], isLoading: loading } = useQuery(
    trpc.quizzes.getAll.queryOptions(),
  );

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
          filteredQuizes.map((quiz, index) => (
            <Link to={`/quiz/$id`} params={{ id: quiz.id.toString() }} key={index}>
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
                  className="h-46 object-cover"
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
            </Link>
          ))
        ) : (
          <div className="col-span-2 py-8 text-center text-white">
            Нет квизов в этой категории
          </div>
        )}
      </div>
    </div>
  );
}
