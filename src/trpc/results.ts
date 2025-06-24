import { TRPCRouterRecord } from "@trpc/server";
import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import { quizResultsTable, usersTable } from "~/lib/db/schema";
import { procedure } from "./init";

export const resultsRouter = {
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
        quizId: result.quizId,
        score: result.score,
      }));
    }),

  createResult: procedure
    .input(
      z.object({
        quizId: z.number(),
        score: z.number(),
        correctAnswers: z.number(),
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

      const user = await db.query.usersTable.findFirst({
        where: eq(usersTable.id, ctx.userId),
      });

      if (!oldResult || oldResult.score === 0 || oldResult.score === null) {
        await db
          .insert(quizResultsTable)
          .values({
            userId: ctx.userId,
            quizId: input.quizId,
            score: input.score,
            correctAnswers: input.correctAnswers,
          })
          .returning();

        await db
          .update(usersTable)
          .set({ totalScore: sql`${usersTable.totalScore || 0} + ${input.score}` })
          .where(eq(usersTable.id, ctx.userId));

        return;
      }

      if (oldResult.score < input.score) {
        await db
          .update(quizResultsTable)
          .set({
            score: input.score,
            correctAnswers: input.correctAnswers,
          })
          .where(
            and(
              eq(quizResultsTable.userId, ctx.userId),
              eq(quizResultsTable.quizId, input.quizId),
            ),
          )
          .returning();

        const scoreDifference = input.score - oldResult.score;

        await db
          .update(usersTable)
          .set({ totalScore: (user?.totalScore || 0) + scoreDifference })
          .where(eq(usersTable.id, ctx.userId));

        return;
      }

      // Если oldResult.score >= input.score, не обновляем ничего
      return;
    }),
} satisfies TRPCRouterRecord;
