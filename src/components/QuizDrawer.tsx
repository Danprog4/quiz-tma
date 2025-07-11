import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { hapticFeedback, shareURL } from "@telegram-apps/sdk";
import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Coin } from "~/components/Coin";
import CustomAudioPlayer from "~/components/CustomAudioPlayer";
import { CustomVideoPlayer } from "~/components/CustomVideoPlayer";
import { FullPageSpinner } from "~/components/Spinner";
import { useUser } from "~/hooks/useUser";
import { useTRPC } from "~/trpc/init/react";

interface QuizDrawerProps {
  quizId: number;
  onClose: () => void;
}

export function QuizDrawer({ quizId, onClose }: QuizDrawerProps) {
  const navigate = useNavigate();
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { user } = useUser();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [isMainVisible, setMainVisible] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || currentQuestion === undefined) return;

    setAnswerSubmitted(true);

    const selected = currentQuestion.answers.find((a) => a.id === selectedAnswer);
    if (selected?.isCorrect) {
      setIsCorrect(true);
      setCorrectAnswers((prev) => prev + 1);
      setScore((prev) => prev + (currentQuestion.points || 0));
      hapticFeedback.notificationOccurred("success");
    } else {
      setIsCorrect(false);
      hapticFeedback.notificationOccurred("error");
    }
  };

  const { data: userQuizResults } = useQuery(
    trpc.main.getUserResult.queryOptions({ quizId: Number(quizId) }),
  );

  const createResultMutation = useMutation(trpc.results.createResult.mutationOptions());

  const { data: quiz } = useQuery(
    trpc.quizzes.getById.queryOptions({ id: Number(quizId) }),
  );

  const { data: questions } = useQuery(
    trpc.quizzes.getQuestions.queryOptions({ quizId: Number(quizId) }),
  );

  const handleStart = async () => {
    try {
      setMainVisible(false);
      setIsFinished(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTotalQuestions(questions?.length || 0);
      setAnswerSubmitted(false);
      setCorrectAnswers(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleRestart = async () => {
    try {
      setMainVisible(false);
      setIsFinished(false);
      setTotalQuestions(questions?.length || 0);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setCurrentQuestionIndex(0);
      setAnswerSubmitted(false);
      setScore(0);
      setCorrectAnswers(0);
    } catch (err) {
      console.error(err);
    }
  };

  const currentQuestion = questions?.[currentQuestionIndex];

  const goToNextQuestion = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setAnswerSubmitted(false);
    } else {
      const oldScore = userQuizResults?.score || 0;

      if (oldScore >= score) {
        setIsFinished(true);

        return;
      }

      const scoreDifference = score - oldScore;

      queryClient.setQueryData(
        trpc.main.getUserResult.queryKey({ quizId: Number(quizId) }),
        (old: any) => ({
          ...old,
          correctAnswers: correctAnswers,
          score: score,
        }),
      );
      queryClient.setQueryData(trpc.main.getUser.queryKey(), (old: any) => ({
        ...old,
        totalScore: old.totalScore + scoreDifference,
      }));
      queryClient.setQueryData(trpc.main.getUserResults.queryKey(), (old: any) => {
        if (!old) return [];

        const existingResult = old.find(
          (result: any) => result.quizId === Number(quizId),
        );

        if (existingResult) {
          return old.map((result: any) =>
            result.quizId === Number(quizId)
              ? { ...result, correctAnswers: correctAnswers }
              : result,
          );
        }
      });
      queryClient.invalidateQueries({
        queryKey: trpc.main.getUserResults.queryKey(),
      });
      createResultMutation.mutate({
        quizId: Number(quizId),
        score: score,
        correctAnswers: correctAnswers,
      });

      setIsFinished(true);
    }
  };

  const renderMediaContent = () => {
    if (!currentQuestion?.mediaUrl) return null;

    switch (currentQuestion.presentationType) {
      case "photo":
        return (
          <img
            className="mx-auto max-h-40 object-cover"
            src={currentQuestion.mediaUrl}
            alt="Question image"
            width={600}
            height={400}
          />
        );
      case "video":
        return <CustomVideoPlayer src={currentQuestion.mediaUrl} />;
      case "audio":
        return <CustomAudioPlayer src={currentQuestion.mediaUrl} />;
      default:
        return null;
    }
  };

  const link = useMemo((): string => {
    return `https://t.me/quiztma_bot?startapp=quizid_${quizId}`;
  }, [quizId]);

  const text = useMemo((): string => {
    return `Пройди квиз ${quiz?.title} в приложении NETQUIZE!`;
  }, [quiz]);

  if (!quiz) {
    return <FullPageSpinner />;
  }

  return (
    <div>
      <AnimatePresence mode="wait" initial={false}>
        {isFinished ? (
          /* Finish Screen */
          <motion.div
            key="finish"
            initial={{
              opacity: 0,
              scale: 0,
              transformOrigin: "center center",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              transformOrigin: "center center",
            }}
            exit={{
              opacity: 0,
              scale: 0,
              transformOrigin: "center center",
            }}
            transition={{
              duration: 0.4,
              ease: [0.175, 0.885, 0.32, 1.275],
              scale: {
                type: "spring",
                stiffness: 300,
                damping: 20,
                restDelta: 0.001,
              },
            }}
            className="h-full min-h-screen w-full bg-[#212121] pb-32 text-white"
          >
            <main className="mx-4 flex flex-col pt-8">
              <section>
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.2,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  className="relative w-full border-2 border-white bg-[#C0C0C0]"
                >
                  <div className="mx-2 mt-2 flex items-center border-b border-black">
                    <div className="mb-2 flex h-6 w-full items-center text-black">
                      <p className="px-2 py-1 text-xl uppercase">
                        {currentQuestionIndex + 1}/{questions?.length || 0}
                      </p>
                    </div>
                    <div
                      style={{
                        borderTop: "3px solid #293133",
                        borderLeft: "3px solid #293133",
                        borderRight: "3px solid white",
                        borderBottom: "3px solid white",
                      }}
                      className="mb-2 flex h-7 w-full items-center"
                    >
                      {Array.from({ length: 12 }).map((_, index) => {
                        const filledSteps = Math.round(
                          ((currentQuestionIndex + 1) / (questions?.length || 0)) * 12,
                        );
                        return (
                          <span
                            key={index}
                            className={`" h-6 w-4 bg-[#010089] ${
                              index < filledSteps
                                ? "border-1 border-r border-b border-[#4D77FF] bg-[#010089]"
                                : "bg-transparent"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                  <div className="flex flex-col items-center px-2 py-2">
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.3,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="flex items-center justify-between"
                    >
                      <h3 className="my-2 text-2xl break-words text-[#25CE16] uppercase">
                        ПОЗДРАВЛЯЕМ!
                      </h3>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.4,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="py-1"
                    >
                      <h2 className="text-md mb-1 text-black">Вы прошли квиз</h2>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.5,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="flex items-center justify-between py-2"
                    >
                      <h3 className="mt-1 text-center text-2xl font-medium break-words text-black uppercase">
                        {quiz.title}
                      </h3>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.6,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="py-2"
                    >
                      <h2 className="text-md text-black">Награда:</h2>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{
                        delay: 0.7,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      className="flex items-center py-4"
                    >
                      <h2 className="mr-1 text-lg text-black">{score}</h2>
                      <Coin />
                    </motion.div>

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.8,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      onClick={() => {
                        onClose();
                        queryClient.invalidateQueries({
                          queryKey: trpc.main.getUserResult.queryKey({
                            quizId: Number(quizId),
                          }),
                        });
                        queryClient.invalidateQueries({
                          queryKey: trpc.main.getUserResults.queryKey(),
                        });
                        navigate({ to: "/" });
                      }}
                      className="mb-1 w-full bg-[#0100BE] px-4 py-3 text-lg text-white"
                    >
                      НА ГЛАВНУЮ
                    </motion.button>

                    <motion.button
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: 0.9,
                        duration: 0.3,
                        ease: "easeOut",
                      }}
                      onClick={handleRestart}
                      className="mt-2 w-full bg-[#AAAAAA] px-4 py-3 text-lg text-white"
                    >
                      ПРОЙТИ ЕЩЕ РАЗ
                    </motion.button>
                  </div>
                </motion.div>
              </section>
            </main>
          </motion.div>
        ) : !isMainVisible ? (
          /* Questions Screen */
          <motion.div
            key="questions"
            initial={{
              opacity: 0,
              scale: 0,
              transformOrigin: "center center",
            }}
            animate={{
              opacity: 1,
              scale: 1,
              transformOrigin: "center center",
            }}
            exit={{
              opacity: 0,
              scale: 0,
              transformOrigin: "center center",
            }}
            transition={{
              duration: 0.5,
              ease: [0.175, 0.885, 0.32, 1.275],
              scale: {
                type: "spring",
                stiffness: 200,
                damping: 20,
                restDelta: 0.001,
              },
            }}
            className="h-full w-full bg-[#212121] pb-32 text-white"
          >
            <main className="mx-4 flex flex-col pt-8">
              <section>
                <motion.div
                  initial={{
                    opacity: 0,
                    scale: 0.8,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.2,
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  className="relative w-full border-2 border-white bg-[#C0C0C0] px-2 py-4"
                >
                  <div className="flex items-center border-b border-black">
                    <div className="mb-2 flex h-6 w-full items-center text-black">
                      <p className="px-2 py-1 text-xl uppercase">
                        {currentQuestionIndex + 1}/{questions?.length || 0}
                      </p>
                    </div>
                    <div
                      style={{
                        borderTop: "3px solid #293133",
                        borderLeft: "3px solid #293133",
                        borderRight: "3px solid white",
                        borderBottom: "3px solid white",
                      }}
                      className="mb-2 flex h-7 w-full items-center"
                    >
                      {Array.from({ length: 12 }).map((_, index) => {
                        const filledSteps = Math.round(
                          ((currentQuestionIndex + 1) / (questions?.length || 0)) * 12,
                        );
                        return (
                          <span
                            key={index}
                            className={`" h-6 w-4 bg-[#010089] ${
                              index < filledSteps
                                ? "border-1 border-r border-b border-[#4D77FF] bg-[#010089]"
                                : "bg-transparent"
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="px-2 py-2">
                    <h3 className="mt-1 mb-2 text-center text-xl break-words text-black uppercase">
                      {currentQuestion?.text}
                    </h3>

                    {renderMediaContent()}

                    <div className="mt-6 space-y-2">
                      {currentQuestion?.answers ? (
                        currentQuestion.answers.map((answer, index) => {
                          const isSelected = selectedAnswer === answer.id;
                          const isSubmitted = answerSubmitted;

                          let bgColor = "bg-gray-200 hover:bg-gray-300";
                          let textColor = "text-black";
                          let border = "";

                          if (isSubmitted && isSelected) {
                            if (answer.isCorrect) {
                              bgColor = "bg-[#25CE16]";
                              border = "border-2 border-[#25CE16]";
                            } else {
                              bgColor = "bg-[#E2302A]";
                              border = "border-2 border-red-500";
                            }
                          } else if (isSelected) {
                            bgColor = "bg-blue-200";
                            textColor = "text-blue-900";
                          }

                          return (
                            <motion.button
                              key={answer.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: 0.3 + index * 0.1,
                                duration: 0.3,
                                ease: "easeOut",
                              }}
                              onClick={() =>
                                !answerSubmitted && setSelectedAnswer(answer.id)
                              }
                              style={{
                                borderTop: "3.5px solid white",
                                borderLeft: "3.5px solid white",
                                borderRight: "3.5px solid #293133",
                                borderBottom: "3.5px solid #293133",
                              }}
                              className={`flex w-full justify-center px-4 py-3 text-lg ${bgColor} ${border} ${textColor} transition-colors`}
                            >
                              {answer.text}
                            </motion.button>
                          );
                        })
                      ) : (
                        <motion.button
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            delay: 0.5,
                            duration: 0.3,
                            ease: "easeOut",
                          }}
                          onClick={goToNextQuestion}
                          disabled={selectedAnswer === null}
                          className={`my-2 mt-6 w-full py-3.5 text-lg font-medium transition-colors ${selectedAnswer !== null ? "bg-[#0100BE] text-white hover:bg-blue-900" : "cursor-not-allowed bg-gray-400 text-white"}`}
                        >
                          Дальше
                        </motion.button>
                      )}
                    </div>

                    {answerSubmitted && selectedAnswer !== null && !isCorrect && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="mt-4 flex justify-center rounded text-lg text-black"
                      >
                        <h1>{currentQuestion?.explanation}</h1>
                      </motion.div>
                    )}

                    {!answerSubmitted ? (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.5,
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === null}
                        className={`my-2 mt-6 w-full py-3.5 text-lg font-medium transition-colors ${selectedAnswer !== null ? "bg-[#0100BE] text-white hover:bg-blue-900" : "cursor-not-allowed bg-gray-400 text-white"}`}
                      >
                        Ответить
                      </motion.button>
                    ) : (
                      <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          delay: 0.3,
                          duration: 0.3,
                          ease: "easeOut",
                        }}
                        onClick={goToNextQuestion}
                        className="my-2 mt-6 w-full bg-[#0100BE] py-3.5 text-lg font-medium text-white hover:bg-blue-900"
                      >
                        {currentQuestionIndex < (questions?.length || 0) - 1
                          ? "Дальше"
                          : "Завершить квиз"}
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              </section>
            </main>
          </motion.div>
        ) : (
          /* Start Screen */
          <motion.div
            key="start"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 0.95,
              filter: "blur(2px)",
            }}
            transition={{
              duration: 0.4,
              ease: "easeInOut",
              filter: { duration: 0.3 },
            }}
            className="h-full w-full pb-32 text-white"
          >
            <main className="mx-4 flex flex-col pt-8">
              <section>
                <div className="relative w-full border-2 border-white bg-[#C0C0C0]">
                  <div className="flex h-6 w-full items-center justify-between bg-[#010089] py-4">
                    <svg
                      className="mx-2"
                      width="55"
                      height="20"
                      viewBox="0 0 45 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M45 14V0L31.2091 0V14H45Z" fill="#C0C0C0" />
                      <path
                        d="M44.2344 0.773686V13.1895L44.9965 14V0L44.2344 0.773686Z"
                        fill="#2A2927"
                      />
                      <path
                        d="M44.2344 0.770765V13.1866L44.6336 13.5918V0.402344L44.2344 0.770765Z"
                        fill="#4C4C4C"
                      />
                      <path
                        d="M44.2358 0.773686L44.9979 0H31.207L32.0054 0.773686H44.2358Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M44.239 0.770765L44.6382 0.402344H31.6094L32.0086 0.770765H44.239Z"
                        fill="#F2F2F2"
                      />
                      <path
                        d="M32.0054 13.1895V0.773686L31.207 0V14L32.0054 13.1895Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M32.0086 13.1866V0.770765L31.6094 0.402344V13.5918L32.0086 13.1866Z"
                        fill="#F2F2F2"
                      />
                      <path
                        d="M32.0054 13.1836L31.207 13.9941H44.9979L44.2358 13.1836H32.0054Z"
                        fill="#2A2927"
                      />
                      <path
                        d="M32.0086 13.1836L31.6094 13.5889H44.6382L44.239 13.1836H32.0086Z"
                        fill="#4C4C4C"
                      />
                      <path
                        d="M44.2343 0.773438H32.0039V13.1892H44.2343V0.773438Z"
                        fill="#C0C0C0"
                      />
                      <path
                        d="M41.3026 2.97517L34.1172 10.2695L34.8871 11.0511L42.0725 3.75671L41.3026 2.97517Z"
                        fill="#1D1D1B"
                      />
                      <path
                        d="M34.8871 2.98018L34.1172 3.76172L41.3026 11.0561L42.0725 10.2745L34.8871 2.98018Z"
                        fill="#1D1D1B"
                      />
                      <path d="M29.3945 14V0L15.6036 0V14H29.3945Z" fill="#C0C0C0" />
                      <path
                        d="M28.6328 0.773686V13.1895L29.3949 14V0L28.6328 0.773686Z"
                        fill="#2A2927"
                      />
                      <path
                        d="M28.6328 0.770765V13.1866L29.032 13.5918V0.402344L28.6328 0.770765Z"
                        fill="#4C4C4C"
                      />
                      <path
                        d="M28.6304 0.773686L29.3925 0H15.6016L16.4 0.773686H28.6304Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M28.6374 0.770765L29.0366 0.402344H16.0078L16.407 0.770765H28.6374Z"
                        fill="#F2F2F2"
                      />
                      <path
                        d="M16.4 13.1895V0.773686L15.6016 0V14L16.4 13.1895Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M16.407 13.1866V0.770765L16.0078 0.402344V13.5918L16.407 13.1866Z"
                        fill="#F2F2F2"
                      />
                      <path
                        d="M16.4 13.1836L15.6016 13.9941H29.3925L28.6304 13.1836H16.4Z"
                        fill="#2A2927"
                      />
                      <path
                        d="M16.407 13.1836L16.0078 13.5889H29.0366L28.6374 13.1836H16.407Z"
                        fill="#4C4C4C"
                      />
                      <path
                        d="M28.6327 0.773438H16.4023V13.1892H28.6327V0.773438Z"
                        fill="#C0C0C0"
                      />
                      <path
                        d="M26.6378 11.1969H18.3633V2.79688H26.6378V11.1969ZM19.452 10.0916H25.5491V3.90214H19.452V10.0916Z"
                        fill="#1D1D1B"
                      />
                      <path
                        d="M26.096 3.34766H18.9102V4.74765H26.096V3.34766Z"
                        fill="#1D1D1B"
                      />
                      <path d="M13.793 14V0L0.00205231 0V14H13.793Z" fill="#C0C0C0" />
                      <path
                        d="M13.0273 0.773686V13.1895L13.7895 14V0L13.0273 0.773686Z"
                        fill="#2A2927"
                      />
                      <path
                        d="M13.0273 0.770765V13.1866L13.4265 13.5918V0.402344L13.0273 0.770765Z"
                        fill="#4C4C4C"
                      />
                      <path
                        d="M13.0288 0.773686L13.7909 0H0L0.798404 0.773686H13.0288Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M13.028 0.770765L13.4272 0.402344H0.398438L0.797639 0.770765H13.028Z"
                        fill="#F2F2F2"
                      />
                      <path
                        d="M0.798404 13.1895V0.773686L0 0V14L0.798404 13.1895Z"
                        fill="#E6E6E6"
                      />
                      <path
                        d="M0.797639 13.1866V0.770765L0.398438 0.402344V13.5918L0.797639 13.1866Z"
                        fill="#F2F2F2"
                      />
                      <path
                        d="M0.798404 13.1836L0 13.9941H13.7909L13.0288 13.1836H0.798404Z"
                        fill="#2A2927"
                      />
                      <path
                        d="M0.797639 13.1836L0.398438 13.5889H13.4272L13.028 13.1836H0.797639Z"
                        fill="#4C4C4C"
                      />
                      <path
                        d="M13.0234 0.773438H0.792969V13.1892H13.0234V0.773438Z"
                        fill="#C0C0C0"
                      />
                      <path
                        d="M9.51115 9.90625H4.28516V11.3799H9.51115V9.90625Z"
                        fill="#1D1D1B"
                      />
                    </svg>
                  </div>
                  <img
                    className="max-h-36 min-h-36 w-full object-cover"
                    src={quiz.imageUrl || "/wtf.jpg"}
                    alt="Quiz cover"
                  />
                  <div className="absolute inset-0 max-h-46 bg-[linear-gradient(to_top,rgba(0,0,0,0.8),transparent)]" />
                  <div className="px-2 py-2">
                    <div className="flex items-center justify-between">
                      <h3 className="mt-1 w-64 text-xl break-words text-black uppercase">
                        {quiz?.title}
                      </h3>
                      <div className="max-h-10">
                        <div className="flex items-center px-2 py-2">
                          <p className="mr-2 text-lg text-black">{quiz?.maxScore}</p>
                          <Coin />
                        </div>
                      </div>
                    </div>
                    <p className="text-md text-gray-800">{quiz?.description}</p>

                    {userQuizResults?.correctAnswers ? (
                      <div className="my-4 flex justify-center">
                        <svg
                          className="mr-2"
                          width="30"
                          height="30"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <rect width="24" height="24" fill="#25CE16" />
                          <path
                            d="M18 6V7.5H16.5V9H15V10.5H13.5V12H12V13.5H10.5V15H9.75V15.75H8.25V15H7.5V13.5H6V12.75H4.5V15H6V16.5H7.5V18H8.25V18.75H9.75V18H10.5V16.5H12V15H13.5V13.5H15V12H16.5V10.5H18V9H19.5V6H18Z"
                            fill="white"
                          />
                        </svg>
                        <p className="text-lg text-black">
                          ПРОЙДЕНО {userQuizResults?.correctAnswers}/{questions?.length}
                        </p>
                      </div>
                    ) : (
                      ""
                    )}

                    <div className="mt-4 flex items-center justify-center gap-1">
                      <motion.button
                        className="flex h-[41px] w-full items-center justify-center bg-[#0100BE] text-lg text-white"
                        onClick={handleStart}
                        whileTap={{ scale: 0.98 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        {userQuizResults?.correctAnswers ? "Пройти ещё раз" : "Пройти"}
                      </motion.button>
                      <button
                        className="flex h-[41px] w-[41px] items-center justify-center bg-[#D9D9D9]"
                        onClick={() => {
                          if (shareURL.isAvailable()) {
                            shareURL(link, text);
                          }
                        }}
                      >
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <g opacity="0.6">
                            <path
                              d="M11.5 7.5H5.5V19.5H17.5V13.5H19.5V21.5H3.5V5.5H11.5V7.5ZM11.5 15.5H9.5V13.5H11.5V15.5ZM13.5 13.5H11.5V11.5H13.5V13.5ZM15.5 11.5H13.5V9.5H15.5V11.5ZM21.5 11.5H19.5V7.5H17.5V5.5H13.5V3.5H21.5V11.5ZM17.5 9.5H15.5V7.5H17.5V9.5Z"
                              fill="black"
                            />
                          </g>
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
