import { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import {
  answersTable,
  categoriesTable,
  questionsTable,
  quizzesTable,
} from "~/lib/db/schema";
import { procedure } from "./init";

export const quizzesRouter = {
  // Получить все квизы
  getAll: procedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      throw new Error("User not found");
    }

    const quizzes = await db.select().from(quizzesTable);

    // Для каждого квиза получаем категории
    const quizzesWithCategories = await Promise.all(
      quizzes.map(async (quiz) => {
        const categories = await db
          .select()
          .from(categoriesTable)
          .where(eq(categoriesTable.quizId, quiz.id));

        return {
          ...quiz,
          categories,
        };
      }),
    );

    return quizzesWithCategories;
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

    // Получаем категории
    const categories = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.quizId, input.id));

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
      categories,
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
