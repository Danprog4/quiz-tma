import { TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import { quizResultsTable } from "~/lib/db/schema";
import { procedure, publicProcedure } from "./init";

export const router = {
  getHello: publicProcedure.query(() => {
    return {
      hello: "world",
    };
  }),
  getUser: procedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const user = await db.query.usersTable.findFirst({
      where: (users) => eq(users.id, userId),
    });
    return user;
  }),

  getUserResults: procedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const results = await db.query.quizResultsTable.findMany({
      where: (quizResults) => eq(quizResults.userId, userId),
    });
    return results;
  }),

  getUserResult: procedure
    .input(z.object({ quizId: z.number() }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const result = await db.query.quizResultsTable.findFirst({
        where: (quizResults) =>
          eq(quizResults.userId, userId) && eq(quizResults.quizId, input.quizId),
      });
      return result;
    }),

  createUserResult: procedure
    .input(
      z.object({
        quizId: z.number(),
        score: z.number(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const result = await db.insert(quizResultsTable).values({
        userId,
        quizId: input.quizId,
        score: input.score,
      });
      return result;
    }),
} satisfies TRPCRouterRecord;

export type Router = typeof router;
