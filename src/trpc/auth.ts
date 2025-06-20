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
      console.log("=== LOGIN MUTATION START ===");
      console.log("Input received:", {
        initDataLength: input.initData.length,
        startParam: input.startParam,
      });

      try {
        console.log("Validating init data...");
        console.log("BOT_TOKEN present:", !!process.env.BOT_TOKEN);
        validate(input.initData, process.env.BOT_TOKEN!, {
          expiresIn: 0,
        });
        console.log("Init data validation successful");
      } catch (error) {
        console.error("Init data validation error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid init data",
        });
      }

      let parsedData;
      try {
        console.log("Parsing init data...");
        parsedData = parse(input.initData);
        console.log("Init data parsed successfully:", {
          hasUser: !!parsedData.user,
          userId: parsedData.user?.id,
          userName: parsedData.user?.first_name,
        });
      } catch (error) {
        console.error("Init data parsing error:", error);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Failed to parse init data",
        });
      }

      const telegramUser = parsedData.user;
      const referrerId = input.startParam?.split("_")[1];
      console.log("Extracted referrer ID:", referrerId);

      if (!telegramUser || !telegramUser.id) {
        console.error("No valid telegram user found:", telegramUser);
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "No valid user data found",
        });
      }

      console.log("Creating JWT token for user:", telegramUser.id);
      let token;
      try {
        token = await new SignJWT({ userId: telegramUser.id })
          .setProtectedHeader({ alg: "HS256" })
          .setIssuedAt()
          .setExpirationTime("1y")
          .sign(new TextEncoder().encode(process.env.JWT_SECRET!));
        console.log("JWT token created successfully");
      } catch (error) {
        console.error("JWT creation error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create authentication token",
        });
      }

      const event = getEvent();
      console.log("Setting auth cookie...");

      try {
        setCookie(event, "auth", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 60 * 60 * 24 * 365,
          path: "/",
        });
        console.log("Auth cookie set successfully");
      } catch (error) {
        console.error("Cookie setting error:", error);
        // Continue execution - cookie failure shouldn't break the login
      }

      console.log("Checking for existing user in database...");
      let existingUser;
      try {
        existingUser = await db.query.usersTable.findFirst({
          where: eq(usersTable.id, telegramUser.id),
        });
        console.log("Database query result:", {
          userExists: !!existingUser,
          userId: existingUser?.id,
          userName: existingUser?.name,
        });
      } catch (error) {
        console.error("Database query error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Database error occurred",
        });
      }

      const name =
        telegramUser.first_name +
        (telegramUser.last_name ? ` ${telegramUser.last_name}` : "");
      console.log("User display name:", name);

      console.log("Checking Telegram membership...");
      let isMember = false;
      try {
        isMember = await checkTelegramMembership({
          userId: telegramUser.id,
          chatId: "-1002741921121",
        });
        console.log("Membership check result:", isMember);
      } catch (error) {
        console.error("Telegram membership check error:", error);
        // Default to false if membership check fails
        isMember = false;
        console.log("Defaulting membership to false due to error");
      }

      if (!existingUser) {
        console.log("Creating new user...");
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

          console.log("New user created successfully:", {
            id: newUser[0]?.id,
            name: newUser[0]?.name,
            isMember: newUser[0]?.isMember,
          });
          console.log("=== LOGIN MUTATION END (NEW USER) ===");
          return newUser[0];
        } catch (error) {
          console.error("User creation error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to create user",
          });
        }
      }

      console.log("Updating existing user membership status...");
      try {
        await db
          .update(usersTable)
          .set({
            isMember,
          })
          .where(eq(usersTable.id, telegramUser.id));
        console.log("User membership status updated successfully");
      } catch (error) {
        console.error("User update error:", error);
        // Continue execution - update failure shouldn't break the login
      }

      console.log("=== LOGIN MUTATION END (EXISTING USER) ===");
      return existingUser;
    }),
} satisfies TRPCRouterRecord;
