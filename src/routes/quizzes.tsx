import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Coin } from "~/components/Coin";
import Tabs from "~/components/Tabs";
import { useUser } from "~/hooks/useUser";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/quizzes")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const { user } = useUser();
  const navigate = useNavigate();

  const { data: quizes, isLoading, error } = useQuery(trpc.quizzes.getAll.queryOptions());

  const handleBack = () => {
    navigate({ to: "/" });
  };

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
        <div className="flex items-center justify-between">
          <svg
            width="12"
            height="21"
            viewBox="0 0 12 21"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 0.5V1.5H8V3.5H6V5.5H4V7.5H2V8.5H1V9.5H0V11.5H1V12.5H2V13.5H4V15.5H6V17.5H7H8V18.5V19.5H10V20.5H12V17.5H10V15.5H8V13.5H6V11.5H4V9.5H6V7.5H8V5.5H10V3.5H12V0.5H10Z"
              fill="white"
            />
          </svg>
          <p onClick={handleBack} className="text-md ml-2 cursor-pointer uppercase">
            назад
          </p>
        </div>
        <div className="flex">
          <p className="mr-2">{user?.totalScore || 0}</p>
          <Coin />
        </div>
      </header>

      <main className="mx-4 flex flex-col">
        <section>
          <div className="flex justify-between">
            <h1 className="text-2xl uppercase">Квизы</h1>
          </div>
          <div className="min-h-[200px]">
            <Tabs />
          </div>
        </section>
      </main>
    </div>
  );
}
