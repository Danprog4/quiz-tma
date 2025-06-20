import {
  bigint,
  boolean,
  integer,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: bigint("id", { mode: "number" }).primaryKey(),
  photoUrl: varchar("photo_url", { length: 255 }),
  name: varchar("name", { length: 255 }),
  totalScore: integer("total_score").default(0),
  isMember: boolean("is_member").default(false),
});

export const quizzesTable = pgTable("quizzes", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url", { length: 500 }),
  isPopular: boolean("is_popular").default(false),
  isNew: boolean("is_new").default(false),
  maxScore: integer("max_score").default(0),
  collaboratorName: varchar("collaborator_name", { length: 255 }),
  collaboratorLogo: varchar("collaborator_logo", { length: 500 }),
  collaboratorLink: varchar("collaborator_link", { length: 500 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const newsTable = pgTable("news", {
  id: serial("id").primaryKey(),
  text: varchar("text").notNull(),
  link: varchar("link", { length: 500 }),
  imageUrl: varchar("image_url", { length: 500 }),
});

export const categoriesTable = pgTable("categories", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .references(() => quizzesTable.id, { onDelete: "cascade" })
    .notNull(),
  name: varchar("name", { length: 100 }).notNull(),
});

export const questionsTable = pgTable("questions", {
  id: serial("id").primaryKey(),
  quizId: integer("quiz_id")
    .references(() => quizzesTable.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  questionType: varchar("question_type", { length: 50 }),
  presentationType: varchar("presentation_type", { length: 50 }),
  mediaUrl: varchar("media_url", { length: 500 }),
  explanation: text("explanation"),
  points: integer("points").default(1),
});

export const answersTable = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id")
    .references(() => questionsTable.id, { onDelete: "cascade" })
    .notNull(),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").default(false),
});

export const quizResultsTable = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: bigint("user_id", { mode: "number" })
    .references(() => usersTable.id, { onDelete: "cascade" })
    .notNull(),
  quizId: integer("quiz_id")
    .references(() => quizzesTable.id, { onDelete: "cascade" })
    .notNull(),
  score: integer("score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  correctAnswers: integer("correct_answers").default(0),
});

// Types
export type User = typeof usersTable.$inferSelect;
export type Quiz = typeof quizzesTable.$inferSelect;
export type Category = typeof categoriesTable.$inferSelect;
export type Question = typeof questionsTable.$inferSelect;
export type Answer = typeof answersTable.$inferSelect;
export type QuizResult = typeof quizResultsTable.$inferSelect;

// Insert types
export type UserInsert = typeof usersTable.$inferInsert;
export type QuizInsert = typeof quizzesTable.$inferInsert;
export type CategoryInsert = typeof categoriesTable.$inferInsert;
export type QuestionInsert = typeof questionsTable.$inferInsert;
export type AnswerInsert = typeof answersTable.$inferInsert;
export type QuizResultInsert = typeof quizResultsTable.$inferInsert;
