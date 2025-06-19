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
        <h1 className="text-2xl uppercase">NETQUIZE</h1>
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
