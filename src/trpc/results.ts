import { TRPCRouterRecord } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
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
      const oldResult = await db.query.quizResultsTable.findFirst({
        where: and(
          eq(quizResultsTable.userId, ctx.userId),
          eq(quizResultsTable.quizId, input.quizId),
        ),
      });

      if (!oldResult || !oldResult.score) {
        await db
          .insert(quizResultsTable)
          .values({
            userId: ctx.userId,
            quizId: input.quizId,
            score: input.score,
          })
          .returning();

        return;
      }

      if (oldResult.score < input.score) {
        await db
          .update(quizResultsTable)
          .set({
            score: input.score,
          })
          .where(
            and(
              eq(quizResultsTable.userId, ctx.userId),
              eq(quizResultsTable.quizId, input.quizId),
            ),
          )
          .returning();
      }

      const newScore = input.score - oldResult.score;

      await db
        .update(usersTable)
        .set({ totalScore: sql`${usersTable.totalScore} + ${newScore}` })
        .where(eq(usersTable.id, ctx.userId));

      return;
    }),
} satisfies TRPCRouterRecord;
