import { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import { quizResultsTable, usersTable } from "~/lib/db/schema";
import { procedure } from "./init";

export const resultsRouter = {
  // Получить результаты пользователя
  getUserResults: procedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error("User not found");
      }

      const results = await db
        .select()
        .from(quizResultsTable)
        .where(eq(quizResultsTable.userId, input.userId));

      return results.map((result) => ({
        quiz_id: result.quizId,
        score: result.score,
      }));
    }),

  // Создать результат квиза
  createResult: procedure
    .input(
      z.object({
        quizId: z.number(),
        score: z.number(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new Error("User not found");
      }

      // Создаем результат
      const result = await db
        .insert(quizResultsTable)
        .values({
          userId: ctx.userId,
          quizId: input.quizId,
          score: input.score,
        })
        .returning();

      // Обновляем общий счет пользователя
      const allResults = await db
        .select()
        .from(quizResultsTable)
        .where(eq(quizResultsTable.userId, ctx.userId));

      const totalScore = allResults.reduce((sum, r) => sum + (r.score || 0), 0);

      await db
        .update(usersTable)
        .set({ totalScore })
        .where(eq(usersTable.id, ctx.userId));

      return result[0];
    }),
} satisfies TRPCRouterRecord;
