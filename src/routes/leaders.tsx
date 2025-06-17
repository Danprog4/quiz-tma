import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Coin } from "~/components/Coin";
import { useUser } from "~/hooks/useUser";
import { useTRPC } from "~/trpc/init/react";

export const Route = createFileRoute("/leaders")({
  component: RouteComponent,
});

function RouteComponent() {
  const trpc = useTRPC();
  const { data: leaderboard, isLoading } = useQuery(
    trpc.main.getLeaderboard.queryOptions({ limit: 50 }),
  );
  const { user } = useUser();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-white"></div>
          <p>Загрузка лидеров...</p>
        </div>
      </div>
    );
  }

  // Get top 3 users for podium display
  const topThree = leaderboard?.slice(0, 3) || [];
  const remainingUsers = leaderboard?.slice(3) || [];

  return (
    <div className="flex min-h-screen flex-col">
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
      <div className="mx-4 text-2xl text-white uppercase">ЛИДЕРЫ</div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="relative z-20 mt-14 flex justify-center gap-8">
          {/* 2nd Place */}
          {topThree[1] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-[#CE7F32]">
                  <img
                    src={topThree[1].photoUrl || "/default-avatar.png"}
                    alt={topThree[1].name || "User"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute right-5 -bottom-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#CE7F32]">
                  <div className="text-xl font-bold">2</div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-white">
                  {topThree[1].name!.substring(0, 10) + "..."}
                </p>
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-xs text-white opacity-60">
                    {topThree[1].totalScore}
                  </span>
                  <Coin />
                </div>
              </div>
            </div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <div className="-mt-8 flex flex-col items-center">
              <div className="relative mb-8">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-[#F2A317]">
                  <img
                    src={topThree[0].photoUrl || "/default-avatar.png"}
                    alt={topThree[0].name || "User"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute right-5 -bottom-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#F2A317]">
                  <div className="text-xl font-bold">1</div>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-white">
                  {topThree[0].name!.substring(0, 10) + "..."}
                </p>
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-xs text-white opacity-60">
                    {topThree[0].totalScore}
                  </span>
                  <Coin />
                </div>
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-[#CACACA]">
                  <img
                    src={topThree[2].photoUrl || "/default-avatar.png"}
                    alt={topThree[2].name || "User"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="absolute right-5 -bottom-4 flex h-10 w-10 items-center justify-center rounded-md bg-[#CACACA]">
                  <div className="text-xl font-bold">3</div>
                </div>
              </div>
              <div className="text-center">
                {topThree[2].name!.substring(0, 10) + "..."}
                <div className="flex flex-col items-center justify-center gap-1">
                  <span className="text-xs text-white opacity-60">
                    {topThree[2].totalScore}
                  </span>
                  <Coin />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Remaining Users List */}
      {remainingUsers.length > 0 && (
        <div className="relative z-20 mt-8 space-y-4">
          {remainingUsers.map((leader, index) => (
            <div
              key={leader.id}
              className="flex items-center justify-between rounded-lg bg-white/10 p-4"
            >
              <div className="flex items-center gap-5">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white/20 text-sm font-bold text-white">
                  {index + 4}
                </div>
                <div className="h-10 w-10 overflow-hidden rounded-full">
                  <img
                    src={leader.photoUrl || "/default-avatar.png"}
                    alt={leader.name || "User"}
                    className="h-full w-full object-cover"
                  />
                </div>
                <span className="text-white">{leader.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white opacity-60">{leader.totalScore}</span>
                <Coin />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
