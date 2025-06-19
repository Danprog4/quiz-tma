import { TRPCRouterRecord } from "@trpc/server";
import { desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "~/lib/db";
import { usersTable } from "~/lib/db/schema";
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

  getLeaderboard: publicProcedure
    .input(z.object({ limit: z.number().optional().default(10) }))
    .query(async ({ input }) => {
      const users = await db
        .select({
          id: usersTable.id,
          name: usersTable.name,
          photoUrl: usersTable.photoUrl,
          totalScore: usersTable.totalScore,
        })
        .from(usersTable)
        .orderBy(desc(usersTable.totalScore))
        .limit(input.limit);

      return users.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
    }),
  getNews: procedure.query(async () => {
    const news = await db.query.newsTable.findMany();
    return news;
  }),
} satisfies TRPCRouterRecord;

export type Router = typeof router;
