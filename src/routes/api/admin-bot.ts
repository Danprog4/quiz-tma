import {
  Conversation,
  conversations,
  createConversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { Bot, Context, webhookCallback } from "grammy";
import { db } from "~/lib/db";
import { answersTable, newsTable, questionsTable, quizzesTable } from "~/lib/db/schema";
import { getIsAdmin } from "~/lib/utils/getIsAdmin";

const bot = new Bot<ConversationFlavor<Context>>(process.env.ADMIN_BOT_TOKEN as string);
bot.use(conversations());

bot.command("start", (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  ctx.reply("Привет, Админ!");
});

async function createNews(conversation: Conversation, ctx: Context) {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  await ctx.reply(
    "Введите текст новости, ссылку и ссылку на изображение. Формат: блаблабла,ссылка,ссылка",
  );

  const { message } = await conversation.waitFor("message:text");
  console.log(message);
  const [text, link, imageUrl] = message.text.split(",");
  try {
    await db.insert(newsTable).values({ text, link, imageUrl });
    await ctx.reply("Новость создана успешно");
  } catch (error) {
    console.error(error, "error");
    await ctx.reply("Не удалось создать новость");
  }
}

bot.use(createConversation(createNews, "createNews"));

bot.command("createNews", async (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }
  await ctx.conversation.enter("createNews");
});

async function createQuiz(conversation: Conversation, ctx: Context) {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  await ctx.reply(
    "Введите данные квиза в формате: название, категория, описание, ссылка на изображение, популярный (true/false), новый (true/false), максимальный балл, имя коллаборатора, логотип коллаборатора, ссылка коллаборатора",
  );

  const { message } = await conversation.waitFor("message:text");
  const parts = message.text.split(",");

  if (parts.length < 7) {
    await ctx.reply("Неверный формат. Попробуйте снова.");
    return;
  }

  const [
    title,
    category,
    description,
    imageUrl,
    isPopular,
    isNew,
    maxScore,
    collaboratorName,
    collaboratorLogo,
    collaboratorLink,
  ] = parts;

  try {
    const quiz = await db
      .insert(quizzesTable)
      .values({
        title: title?.trim(),
        category: category?.trim(),
        description: description?.trim(),
        imageUrl: imageUrl?.trim() || null,
        isPopular: isPopular?.trim() === "true",
        isNew: isNew?.trim() === "true",
        maxScore: maxScore ? parseInt(maxScore.trim()) : 0,
        collaboratorName: collaboratorName?.trim() || null,
        collaboratorLogo: collaboratorLogo?.trim() || null,
        collaboratorLink: collaboratorLink?.trim() || null,
      })
      .returning();

    await ctx.reply(`Квиз "${title}" создан успешно! ID: ${quiz[0].id}`);

    // Цикл для создания вопросов
    let questionCount = 0;
    while (true) {
      await ctx.reply(
        `Создай вопрос #${questionCount + 1} для квиза "${title}". В формате: вопрос, тип презентации (text/photo/video/audio), ссылка на медиа (или пустое), объяснение, баллы`,
      );

      const { message: questionMessage } = await conversation.waitFor("message:text");
      const questionParts = questionMessage.text.split(",");

      if (questionParts.length < 5) {
        await ctx.reply("Неверный формат вопроса. Попробуйте снова.");
        continue;
      }

      const [questionText, presentationType, mediaUrl, explanation, points] =
        questionParts;

      try {
        const questionResult = await db
          .insert(questionsTable)
          .values({
            quizId: quiz[0].id,
            text: questionText?.trim(),
            presentationType: presentationType?.trim() as any,
            questionType: "multiple_choice",
            mediaUrl: mediaUrl?.trim() || null,
            explanation: explanation?.trim(),
            points: points ? parseInt(points.trim()) : 1,
          })
          .returning();

        await ctx.reply(`Вопрос #${questionCount + 1} создан успешно!`);

        // Цикл для создания ответов к текущему вопросу
        let answerCount = 0;
        while (true) {
          await ctx.reply(
            `Создай ответ #${answerCount + 1} для вопроса "${questionText}". В формате: текст ответа, правильный (true/false)`,
          );

          const { message: answerMessage } = await conversation.waitFor("message:text");
          const answerParts = answerMessage.text.split(",");

          if (answerParts.length < 2) {
            await ctx.reply("Неверный формат ответа. Попробуйте снова.");
            continue;
          }

          const [answerText, isCorrect] = answerParts;

          try {
            await db.insert(answersTable).values({
              questionId: questionResult[0].id,
              text: answerText?.trim(),
              isCorrect: isCorrect?.trim() === "true",
            });

            answerCount++;
            await ctx.reply(`Ответ #${answerCount} создан успешно!`);

            await ctx.reply(
              "Добавить ещё один ответ к этому вопросу? Введи 'да' или 'нет'",
            );

            const { message: addAnswerMessage } =
              await conversation.waitFor("message:text");
            if (addAnswerMessage.text.toLowerCase() !== "да") {
              break;
            }
          } catch (error) {
            console.error("Error creating answer:", error);
            await ctx.reply("Ошибка при создании ответа. Попробуйте снова.");
          }
        }

        questionCount++;
        await ctx.reply(
          `Вопрос #${questionCount} завершён. Добавить ещё один вопрос к квизу "${title}"? Введи 'да' или 'нет'`,
        );

        const { message: addQuestionMessage } =
          await conversation.waitFor("message:text");
        if (addQuestionMessage.text.toLowerCase() !== "да") {
          await ctx.reply(
            `Квиз "${title}" создан полностью! Всего вопросов: ${questionCount}`,
          );
          break;
        }
      } catch (error) {
        console.error("Error creating question:", error);
        await ctx.reply("Ошибка при создании вопроса. Попробуйте снова.");
      }
    }
  } catch (error) {
    console.error("Error creating quiz:", error);
    await ctx.reply("Ошибка при создании квиза. Попробуйте снова.");
  }
}

bot.use(createConversation(createQuiz, "createQuiz"));

bot.command("createQuiz", async (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }
  await ctx.conversation.enter("createQuiz");
});

const update = webhookCallback(bot, "std/http");

const handleUpdate = async (request: Request) => {
  return await update(request);
};

export const APIRoute = createAPIFileRoute("/api/admin-bot")({
  GET: async ({ request }) => handleUpdate(request),
  POST: async ({ request }) => handleUpdate(request),
});
