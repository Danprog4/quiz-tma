import { authRouter } from "../auth";
import { router } from "../main";
import { quizzesRouter } from "../quizzes";
import { resultsRouter } from "../results";

import { createTRPCRouter } from "./index";

export const trpcRouter = createTRPCRouter({
  main: router,
  auth: authRouter,
  quizzes: quizzesRouter,
  results: resultsRouter,
});

export type TRPCRouter = typeof trpcRouter;
