import { getEvent, setCookie } from "@tanstack/react-start/server";
import { parse, validate } from "@telegram-apps/init-data-node";
import { TRPCError, TRPCRouterRecord } from "@trpc/server";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { z } from "zod";
import { db } from "~/lib/db";
import { usersTable } from "~/lib/db/schema";
import { checkTelegramMembership } from "~/lib/utils/checkIsMember";
import { publicProcedure } from "./init";

export const authRouter = {
  login: publicProcedure
    .input(
      z.object({
        initData: z.string(),
        startParam: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      try {
        console.log(input.initData, "input.initData");
        console.log(process.env.BOT_TOKEN, "process.env.BOT_TOKEN");
        validate(input.initData, process.env.BOT_TOKEN!, {
          expiresIn: 0,
        });
      } catch (error) {
        console.error("Init data validation error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid init data",
        });
      }

      let parsedData;
      try {
        parsedData = parse(input.initData);
      } catch (error) {
        console.error("Init data parsing error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to parse init data",
        });
      }

      console.log(parsedData, "parsedData");

      const telegramUser = parsedData.user;
      const referrerId = input.startParam?.split("_")[1];
      console.log(referrerId, "startParam");

      if (!telegramUser || !telegramUser.id) {
        console.error("No valid telegram user found:", telegramUser);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No valid user data found",
        });
      }

      let token;
      try {
        token = await new SignJWT({ userId: telegramUser.id })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("1y")
          .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
      } catch (error) {
        console.error("JWT creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create authentication token",
        });
      }

      console.log(token, "token auth");

      const event = getEvent();

      try {
        setCookie(event, "auth", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 365,
          path: "/",
        });
      } catch (error) {
        console.error("Cookie setting error:", error);
        // Continue execution - cookie failure shouldn't break the login
      }

      console.log(event, "event auth");
      console.log(telegramUser, "telegramUser");

      let existingUser;
      try {
        existingUser = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, telegramUser.id),
        });
      } catch (error) {
        console.error("Database query error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database error occurred",
        });
      }

      console.log(existingUser, "existingUser");

      const name =
        telegramUser.first_name +
        (telegramUser.last_name ? ` ${telegramUser.last_name}` : "");

      let isMember = false;
      try {
        isMember = await checkTelegramMembership({
          userId: telegramUser.id,
          chatId: "-1002741921121",
        });
      } catch (error) {
        console.error("Telegram membership check error:", error);
        // Default to false if membership check fails
        isMember = false;
      }

      if (!existingUser) {
        try {
          const newUser = await db
            .insert(usersTable)
            .values({
              id: telegramUser.id,
              name,
              photoUrl: telegramUser.photo_url || null,
              isMember,
            })
            .returning();

          console.log(newUser, "newUser");
          return newUser[0];
        } catch (error) {
          console.error("User creation error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }
      }

      try {
        await db
          .update(usersTable)
          .set({
            isMember,
          })
          .where(eq(usersTable.id, telegramUser.id));
      } catch (error) {
        console.error("User update error:", error);
        // Continue execution - update failure shouldn't break the login
      }

      return existingUser;
    }),
} satisfies TRPCRouterRecord;
