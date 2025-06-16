import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFileRoute,
  useNavigate,
  useParams,
  useRouter,
} from "@tanstack/react-router";
import { hapticFeedback } from "@telegram-apps/sdk";
import { useState } from "react";
import { Coin } from "~/components/Coin";
import CustomAudioPlayer from "~/components/CustomAudioPlayer";
import { CustomVideoPlayer } from "~/components/CustomVideoPlayer";
import { useUser } from "~/hooks/useUser";
import { useTRPC } from "~/trpc/init/react";

type QuizBasic = {
  id: number;
  title: string;
  description: string;
  image_url: string;
  is_popular?: boolean;
  is_new?: boolean;
  max_score: number;
  collaborator_name?: string;
  collaborator_logo?: string;
  collaborator_link?: string;
  categories: { name: string; id: number; quiz_id: number }[];
};

type Question = {
  id: number;
  text: string;
  question_type: string;
  presentation_type: string;
  media_url: string | null;
  explanation: string;
  points: number;
  answers: {
    id: number;
    text: string;
    is_correct: boolean;
  }[];
};

export const Route = createFileRoute("/quiz/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();
  const params = useParams({ from: "/quiz/$id" });
  const id = params.id as string;
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
  const navigate = useNavigate();

  const [totalQuestions, setTotalQuestions] = useState<number>(0);

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null || currentQuestion === undefined) return;

    setAnswerSubmitted(true);

    const selected = currentQuestion.answers.find((a) => a.id === selectedAnswer);
    if (selected?.isCorrect) {
      setIsCorrect(true);
      setScore((prev) => prev + (currentQuestion.points || 0));
      hapticFeedback.notificationOccurred("success");
    } else {
      setIsCorrect(false);
      hapticFeedback.notificationOccurred("error");
    }
  };

  const { data: userQuizCoins } = useQuery(
    trpc.main.getUserResult.queryOptions({ quizId: Number(id) }),
  );

  const createResultMutation = useMutation(trpc.results.createResult.mutationOptions());

  const { data: quiz } = useQuery(trpc.quizzes.getById.queryOptions({ id: Number(id) }));

  const questionPrice = quiz?.questions.length
    ? quiz.maxScore! / quiz.questions.length
    : 0;

  const userQuizResult = userQuizCoins?.score! / questionPrice!;

  console.log(userQuizResult, "userQuizResult");

  console.log(questionPrice, "questionPrice");

  const { data: questions } = useQuery(
    trpc.quizzes.getQuestions.queryOptions({ quizId: Number(id) }),
  );

  console.log(quiz?.questions, questions, "questions");
  const handleStart = async () => {
    try {
      setMainVisible(false);
      setIsFinished(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTotalQuestions(questions?.length || 0);
      setAnswerSubmitted(false);
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
    } catch (err) {
      console.error(err);
    }
  };

  const currentQuestion = questions?.[currentQuestionIndex];

  const handleAnswerSelect = (answerId: number, isCorrect: boolean) => {
    setSelectedAnswer(answerId);
    setIsCorrect(isCorrect);
  };

  const goToNextQuestion = () => {
    if (currentQuestionIndex < (questions?.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setAnswerSubmitted(false);
    } else {
      const oldScore = userQuizCoins?.score || 0;

      // Если старый результат больше или равен новому, не обновляем ничего
      if (oldScore >= score) {
        setIsFinished(true);
        return;
      }

      // Если новый результат лучше, обновляем и прибавляем только разницу
      const scoreDifference = score - oldScore;

      queryClient.setQueryData(
        trpc.results.getUserResults.queryKey({ userId: user?.id }),
        (old: any) => ({
          ...old,
          score: score,
        }),
      );
      queryClient.setQueryData(trpc.main.getUser.queryKey(), (old: any) => ({
        ...old,
        totalScore: old.totalScore + scoreDifference,
      }));
      createResultMutation.mutate({
        quizId: Number(id),
        score: score,
      });

      setIsFinished(true);
    }
  };

  console.log(score, "score");

  const handleBack = () => {
    navigate({ to: "/" });
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

  if (!quiz) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-black text-white">
        Quiz not found
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="relative h-full min-h-screen w-full bg-black text-white">
        <div className="pointer-events-none absolute inset-0 z-10">
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
              на главную
            </p>
          </div>
          <div className="flex">
            <p className="mr-2">{user?.totalScore || 0}</p>
            <Coin />
          </div>
        </header>
        <main className={`mx-4 flex flex-col`}>
          <section>
            <div className="relative w-full border-2 border-white bg-[#C0C0C0]">
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
                <div className="flex items-center justify-between">
                  <h3 className="my-2 text-2xl break-words text-[#25CE16] uppercase">
                    ПОЗДРАВЛЯЕМ!
                  </h3>
                </div>
                <div className="py-1">
                  <h2 className="text-md mb-1 text-black">Вы прошли квиз</h2>
                </div>
                <div className="flex items-center justify-between py-2">
                  <h3 className="mt-1 text-2xl font-medium break-words text-black uppercase">
                    {quiz.title}
                  </h3>
                </div>
                <div className="py-2">
                  <h2 className="text-md text-black">Награда:</h2>
                </div>

                <div className="flex items-center py-4">
                  <h2 className="mr-1 text-lg text-black">{score}</h2>
                  <Coin />
                </div>

                <button
                  onClick={() => navigate({ to: "/" })}
                  className="mb-1 w-full bg-[#0100BE] px-4 py-3 text-lg text-white"
                >
                  НА ГЛАВНУЮ
                </button>

                <button
                  onClick={handleRestart}
                  className="mt-2 w-full bg-[#AAAAAA] px-4 py-3 text-lg text-white"
                >
                  ПРОЙТИ ЕЩЕ РАЗ
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="relative h-full min-h-screen w-full bg-black text-white">
      <div className="pointer-events-none absolute inset-0 z-10">
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
            на главную
          </p>
        </div>
        <div className="flex">
          <p className="mr-2">{user?.totalScore || 0}</p>
          <Coin />
        </div>
      </header>

      <main className={`mx-4 flex flex-col ${isMainVisible ? "" : "hidden"}`}>
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
              className="max-h-36 w-full object-cover"
              src={quiz?.imageUrl || "/placeholder.png"}
              alt="Quiz cover"
            />
            <div className="absolute inset-0 max-h-46 bg-[linear-gradient(to_top,rgba(0,0,0,0.8),transparent)]" />
            <div className="px-2 py-2">
              <div className="flex items-center justify-between">
                <h3 className="mt-1 w-64 text-xl break-words text-black uppercase">
                  {quiz?.title}
                </h3>
                <div className="max-h-10 bg-[#CECECE]">
                  <div className="flex items-center px-2 py-2">
                    <p className="mr-2 text-lg text-black">{quiz?.maxScore}</p>
                    <Coin />
                  </div>
                </div>
              </div>
              {quiz?.collaboratorName !== "string" && quiz?.collaboratorName && (
                <div className="py-2">
                  <h2 className="mb-1 text-lg text-black">Соавтор</h2>
                  <div className="flex items-center">
                    <img
                      className="h-8 w-8 rounded-full object-cover"
                      src={quiz?.collaboratorLogo || "/placeholder.png"}
                      alt="Collaborator logo"
                    />
                    <h2 className="ml-2 text-lg text-black uppercase">
                      {quiz?.collaboratorName}
                    </h2>
                  </div>
                </div>
              )}
              <p className="text-md text-gray-800">{quiz?.description}</p>

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
                  ПРОЙДЕНО {userQuizResult || 0}/{questions?.length || 0}
                </p>
              </div>

              <button
                className="mt-2 w-full bg-[#0100BE] px-4 py-3 text-lg text-white"
                onClick={handleStart}
              >
                Пройти
              </button>
            </div>
          </div>
        </section>
      </main>

      <main className={`mx-4 flex flex-col ${isMainVisible ? "hidden" : ""}`}>
        <section>
          <div className="relative w-full border-2 border-white bg-[#C0C0C0] px-2 py-4">
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
                {currentQuestion?.answers.map((answer) => {
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
                    <button
                      key={answer.id}
                      onClick={() => !answerSubmitted && setSelectedAnswer(answer.id)}
                      style={{
                        borderTop: "3.5px solid white",
                        borderLeft: "3.5px solid white",
                        borderRight: "3.5px solid #293133",
                        borderBottom: "3.5px solid #293133",
                      }}
                      className={`flex w-full justify-center px-4 py-3 text-lg ${bgColor} ${border} ${textColor} transition-colors`}
                    >
                      {answer.text}
                    </button>
                  );
                })}
              </div>

              {answerSubmitted && selectedAnswer !== null && !isCorrect && (
                <div className="mt-4 flex justify-center rounded text-lg text-black">
                  <h1>{currentQuestion?.explanation}</h1>
                </div>
              )}

              {!answerSubmitted ? (
                <button
                  onClick={handleSubmitAnswer}
                  disabled={selectedAnswer === null}
                  className={`my-2 mt-6 w-full py-3.5 text-lg font-medium transition-colors ${selectedAnswer !== null ? "bg-[#0100BE] text-white hover:bg-blue-900" : "cursor-not-allowed bg-gray-400 text-white"}`}
                >
                  Ответить
                </button>
              ) : (
                <button
                  onClick={goToNextQuestion}
                  className="my-2 mt-6 w-full bg-[#0100BE] py-3.5 text-lg font-medium text-white hover:bg-blue-900"
                >
                  {currentQuestionIndex < (questions?.length || 0) - 1
                    ? "Далее"
                    : "Завершить квиз"}
                </button>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
