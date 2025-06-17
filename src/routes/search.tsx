import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useTRPC } from "~/trpc/init/react";
import { Navbar } from "../components/Navbar";

export const Route = createFileRoute("/search")({
  component: SearchPage,
});

function SearchPage() {
  const trpc = useTRPC();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { data: quizes } = useQuery(trpc.quizzes.getAll.queryOptions());

  return (
    <div className="min-h-screen px-4 text-white">
      {/* Header */}
      <div className="pointer-events-none absolute inset-0 z-10">
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
        <div className="mt-3 grid grid-cols-2 gap-5">
          {quizes
            ?.filter(
              (quiz) =>
                quiz.title.toLowerCase().includes(search.toLowerCase()) ||
                quiz.collaboratorName?.toLowerCase().includes(search.toLowerCase()),
            )
            .map((quiz) => (
              <div
                key={quiz.id}
                className="cursor-pointer"
                onClick={() => navigate({ to: `/quiz/${quiz.id}` })}
              >
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

interface QuizCardProps {
  title: string;
  category: string;
  badge: string;
  badgeColor: string;
  progress?: string;
  isCompleted?: boolean;
}

function QuizCard({
  title,
  category,
  badge,
  badgeColor,
  progress,
  isCompleted,
}: QuizCardProps) {
  return (
    <div className="relative h-[181px] w-[134px] border-2 border-black">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img src="/quiz-card-bg.png" alt="" className="h-full w-full object-cover" />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>

      {/* Category Header */}
      <div className="absolute top-0 right-0 left-0 flex h-5 items-center bg-gradient-to-r from-[#010089] to-[#0100BE]">
        <span className="px-1.5 text-xs font-normal text-[#EDEDED]">{category}</span>
      </div>

      {/* Content */}
      <div className="absolute right-2 bottom-2 left-2">
        <div className="space-y-1.5">
          <span
            className={`inline-block px-0 text-xs font-normal ${badgeColor === "bg-[#6CED52]" ? "text-[#6CED52]" : "text-[#F97316]"}`}
          >
            {badge}
          </span>
          <p className="text-xs leading-tight font-normal text-[#EDEDED]">{title}</p>
        </div>
      </div>

      {/* Progress Indicator (for completed quizzes) */}
      {isCompleted && progress && (
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 transform">
          <div className="flex flex-col items-center gap-1.5 rounded bg-black/60 px-3 py-1.5">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#25CE16]">
              <svg width="15" height="12" viewBox="0 0 15 12" fill="none">
                <path
                  d="M1.5 6L5.5 10L13.5 2"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-xs font-normal text-white">Пройдено</span>
            <span className="text-xs font-normal text-white">{progress}</span>
          </div>
        </div>
      )}
    </div>
  );
}
