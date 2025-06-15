import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
      });
      await Promise.all(prefetchQuizPromises);

      await queryClient.prefetchQuery(trpc.main.getUserResults.queryOptions());
    } catch (error) {
      console.error("Error prefetching data:", error);
    } finally {
      setIsFinished(true);
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
  }, [initData, startParam, loginMutation.isPending]);

  if (!isFinished) {
    return <FullPageSpinner />;
  }

  if (isError) {
    return <div>Error</div>;
  }

  return <>{children}</>;
};
