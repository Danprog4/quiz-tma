import { useMutation, useQueryClient } from "@tanstack/react-query";
import { initData as frontInitData } from "@telegram-apps/sdk";
import { useEffect, useState } from "react";
import { setOpenQuizId } from "~/store";
import { useTRPC } from "~/trpc/init/react";
import { FullPageSpinner } from "./Spinner";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isFinished, setIsFinished] = useState(false);
  const [isError, setIsError] = useState(false);
  const trpc = useTRPC();
  const [initData, setInitData] = useState<string | null>(null);
  const [startParam, setStartParam] = useState<string | undefined>(undefined);
  const queryClient = useQueryClient();

  const loginMutation = useMutation(
    trpc.auth.login.mutationOptions({
      onSuccess: async () => {
        await prefetchRequiredData();
      },
      onError: () => {
        setIsError(true);
      },
    }),
  );

  const prefetchRequiredData = async () => {
    try {
      await queryClient.prefetchQuery(trpc.main.getUser.queryOptions());

      const quizzes = await queryClient.fetchQuery(trpc.quizzes.getAll.queryOptions());

      const prefetchQuizPromises = quizzes.map(async (quiz) => {
        await queryClient.prefetchQuery(
          trpc.quizzes.getById.queryOptions({ id: quiz.id }),
        );
        await queryClient.prefetchQuery(
          trpc.quizzes.getQuestions.queryOptions({ quizId: quiz.id }),
        );
        await queryClient.prefetchQuery(
          trpc.main.getLeaderboard.queryOptions({ limit: 50 }),
        );

        await queryClient.prefetchQuery(
          trpc.main.getUserResult.queryOptions({ quizId: quiz.id }),
        );
      });
      await Promise.all(prefetchQuizPromises);

      if (frontInitData.startParam) {
        console.log("frontInitData.startParam", frontInitData.startParam());
        setOpenQuizId(Number(frontInitData.startParam()));
      }

      setIsFinished(true);
    } catch (error) {
      console.error("Error prefetching data:", error);
    }
  };

  useEffect(() => {
    const loadTelegramSDK = async () => {
      try {
        const { retrieveRawInitData, retrieveLaunchParams } = await import(
          "@telegram-apps/sdk"
        );

        const getTelegramInitData = retrieveRawInitData();
        const getTelegramLaunchParams = retrieveLaunchParams();

        setInitData(getTelegramInitData!);
        setStartParam(getTelegramLaunchParams.tgWebAppStartParam);
      } catch (error) {
        setIsError(true);
      }
    };

    loadTelegramSDK();
  }, []);

  useEffect(() => {
    if (initData && !loginMutation.isPending) {
      loginMutation.mutate({
        initData,
        startParam,
      });
    }
  }, [initData, startParam]);

  if (!isFinished && loginMutation.isPending) {
    return <FullPageSpinner />;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return <>{children}</>;
};
