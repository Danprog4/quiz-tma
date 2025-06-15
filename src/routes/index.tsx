import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Coin } from "~/components/Coin";
import Slider from "~/components/Slider";
import { useUser } from "~/hooks/useUser";
import { useTRPC } from "~/trpc/init/react";

interface Quiz {
  id: number;
  title: string;
  description: string;
  image_url: string;
  is_popular: boolean;
  is_new: boolean;
  max_score: number;
  collaborator_name: string;
  collaborator_logo: string;
  collaborator_link: string;
  categories: { name: string; id: number; quiz_id: number }[];
  questions: any[];
  score_ratings: any[];
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

  const { data: quizes, isLoading, error } = useQuery(trpc.quizzes.getAll.queryOptions());

  return (
    <div className="relative min-h-screen w-full bg-black text-white">
      <div className="pointer-events-none absolute inset-0 z-10">
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
                  <div className="h-6 w-full bg-[#010089]">
                    <p className="px-2 py-1 text-xs uppercase">
                      {quiz.categories.map((cat) => cat.name).join(", ")}
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
        </section>
      </main>
    </div>
  );
}
