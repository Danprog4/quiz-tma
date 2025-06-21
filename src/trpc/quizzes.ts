import { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import { answersTable, questionsTable, quizzesTable } from "~/lib/db/schema";
import { procedure } from "./init";

export const quizzesRouter = {
  // Получить все квизы
  getAll: procedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new Error("User not found");
    }

    const quizzes = await db.select().from(quizzesTable);

    // Для каждого квиза получаем категории и вопросы
    const quizzesWithCategoriesAndQuestions = await Promise.all(
      quizzes.map(async (quiz) => {
        const questions = await db
          .select()
          .from(questionsTable)
          .where(eq(questionsTable.quizId, quiz.id));

        return {
          ...quiz,

          questions,
        };
      }),
    );

    return quizzesWithCategoriesAndQuestions;
  }),

  // Получить квиз по ID
  getById: procedure.input(z.object({ id: z.number() })).query(async ({ input, ctx }) => {
    if (!ctx.userId) {
      throw new Error("User not found");
    }

    const quiz = await db
      .select()
      .from(quizzesTable)
      .where(eq(quizzesTable.id, input.id))
      .limit(1);

    if (!quiz[0]) {
      throw new Error("Quiz not found");
    }

    // Получаем вопросы с ответами
    const questions = await db
      .select()
      .from(questionsTable)
      .where(eq(questionsTable.quizId, input.id));

    const questionsWithAnswers = await Promise.all(
      questions.map(async (question) => {
        const answers = await db
          .select()
          .from(answersTable)
          .where(eq(answersTable.questionId, question.id));

        return {
          ...question,
          answers,
        };
      }),
    );

    return {
      ...quiz[0],

      questions: questionsWithAnswers,
    };
  }),

  // Получить вопросы квиза
  getQuestions: procedure
    .input(z.object({ quizId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error("User not found");
      }

      const questions = await db
        .select()
        .from(questionsTable)
        .where(eq(questionsTable.quizId, input.quizId));

      const questionsWithAnswers = await Promise.all(
        questions.map(async (question) => {
          const answers = await db
            .select()
            .from(answersTable)
            .where(eq(answersTable.questionId, question.id));

          return {
            ...question,
            answers,
          };
        }),
      );

      return questionsWithAnswers;
    }),
} satisfies TRPCRouterRecord;
