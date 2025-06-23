import {
  Conversation,
  conversations,
  createConversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { eq } from "drizzle-orm";
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

  // Собираем все данные квиза перед созданием в БД
  const quizData = {
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
  };

  // Собираем все вопросы и ответы перед созданием в БД
  const questionsData: Array<{
    text: string;
    presentationType: string;
    mediaUrl: string | null;
    explanation: string;
    points: number;
    answers: Array<{ text: string; isCorrect: boolean }>;
  }> = [];

  // Цикл для сбора вопросов
  let questionCount = 0;
  while (true) {
    await ctx.reply(
      `Создай вопрос #${questionCount + 1} для квиза "${title}". В формате: вопрос, тип презентации (text/photo/video/audio), ссылка на медиа (или пустое), объяснение, баллы`,
    );

    let questionMessage;
    let questionParts;

    // Повторяем пока не получим правильный формат
    while (true) {
      const response = await conversation.waitFor("message:text");
      questionMessage = response.message;
      questionParts = questionMessage.text.split(",");

      if (questionParts.length >= 5) {
        break;
      }

      await ctx.reply(
        "Неверный формат вопроса. Попробуйте снова. Формат: вопрос, тип презентации (text/photo/video/audio), ссылка на медиа (или пустое), объяснение, баллы",
      );
    }

    const [questionText, presentationType, mediaUrl, explanation, points] = questionParts;

    const questionData = {
      text: questionText?.trim(),
      presentationType: presentationType?.trim(),
      mediaUrl: mediaUrl?.trim() || null,
      explanation: explanation?.trim(),
      points: points ? parseInt(points.trim()) : 1,
      answers: [] as Array<{ text: string; isCorrect: boolean }>,
    };

    // Цикл для сбора ответов к текущему вопросу
    let answerCount = 0;
    while (true) {
      await ctx.reply(
        `Создай ответ #${answerCount + 1} для вопроса "${questionText}". В формате: текст ответа, правильный (true/false)`,
      );

      let answerMessage;
      let answerParts;

      // Повторяем пока не получим правильный формат
      while (true) {
        const response = await conversation.waitFor("message:text");
        answerMessage = response.message;
        answerParts = answerMessage.text.split(",");

        if (answerParts.length >= 2) {
          break;
        }

        await ctx.reply(
          "Неверный формат ответа. Попробуйте снова. Формат: текст ответа, правильный (true/false)",
        );
      }

      const [answerText, isCorrect] = answerParts;

      questionData.answers.push({
        text: answerText?.trim(),
        isCorrect: isCorrect?.trim() === "true",
      });

      answerCount++;
      await ctx.reply(`Ответ #${answerCount} добавлен!`);

      await ctx.reply("Добавить ещё один ответ к этому вопросу? Введи 'да' или 'нет'");

      const { message: addAnswerMessage } = await conversation.waitFor("message:text");
      if (addAnswerMessage.text.toLowerCase() !== "да") {
        break;
      }
    }

    questionsData.push(questionData);
    questionCount++;

    await ctx.reply(
      `Вопрос #${questionCount} собран. Добавить ещё один вопрос к квизу "${title}"? Введи 'да' или 'нет'`,
    );

    const { message: addQuestionMessage } = await conversation.waitFor("message:text");
    if (addQuestionMessage.text.toLowerCase() !== "да") {
      break;
    }
  }

  // Теперь создаем всё в базе данных одной транзакцией
  try {
    await ctx.reply("Сохраняю квиз в базу данных...");

    // Создаем квиз
    const quiz = await db.insert(quizzesTable).values(quizData).returning();

    // Создаем вопросы и ответы
    for (const questionData of questionsData) {
      const question = await db
        .insert(questionsTable)
        .values({
          quizId: quiz[0].id,
          text: questionData.text,
          presentationType: questionData.presentationType as any,
          questionType: "multiple_choice",
          mediaUrl: questionData.mediaUrl,
          explanation: questionData.explanation,
          points: questionData.points,
        })
        .returning();

      // Создаем ответы для этого вопроса
      for (const answerData of questionData.answers) {
        await db.insert(answersTable).values({
          questionId: question[0].id,
          text: answerData.text,
          isCorrect: answerData.isCorrect,
        });
      }
    }

    await ctx.reply(
      `✅ Квиз "${title}" создан полностью!\n` +
        `ID квиза: ${quiz[0].id}\n` +
        `Всего вопросов: ${questionsData.length}\n` +
        `Всего ответов: ${questionsData.reduce((sum, q) => sum + q.answers.length, 0)}`,
    );
  } catch (error) {
    console.error("Error creating quiz:", error);
    await ctx.reply("❌ Ошибка при создании квиза в базе данных. Попробуйте снова.");
  }
}

bot.use(createConversation(createQuiz, "create_quiz"));

bot.command("create_quiz", async (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }
  await ctx.conversation.enter("create_quiz");
});

async function updateQuiz(conversation: Conversation, ctx: Context) {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  await ctx.reply("Введите ID или название квиза, который хотите обновить:");

  let quiz;
  while (true) {
    const { message } = await conversation.waitFor("message:text");
    const response = message.text;

    // Пытаемся парсить как число, если не получается - ищем по названию
    const idAsNumber = parseInt(response);
    const isValidId = !isNaN(idAsNumber);

    quiz = await db.query.quizzesTable.findFirst({
      where: isValidId
        ? eq(quizzesTable.id, idAsNumber)
        : eq(quizzesTable.title, response),
    });

    if (!quiz) {
      await ctx.reply("Квиз не найден, попробуйте ввести ID или название еще раз");
      continue;
    } else {
      break;
    }
  }

  while (true) {
    await ctx.reply(
      "Введите что хотите обновить. Например, название, описание, ссылка на изображение, популярность, новый, максимальный балл, имя коллаборатора, логотип коллаборатора, ссылка коллаборатора. Можно ввести только одно поле",
    );

    const { message } = await conversation.waitFor("message:text");
    const update = message.text;

    switch (update) {
      case "название":
        await ctx.reply("Введите новое название квиза");
        const { message: newTitle } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ title: newTitle.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply(
          "Название квиза обновлено. Напишите 'да' если хотите обновить что-то ещё или 'нет' если хотите закончить",
        );
        const { message: titleContinue } = await conversation.waitFor("message:text");
        if (titleContinue.text.toLowerCase() !== "да") {
          break;
        }
      case "описание":
        await ctx.reply("Введите новое описание квиза");
        const { message: newDescription } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ description: newDescription.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply(
          "Описание квиза обновлено. Напишите 'да' если хотите обновить что-то ещё или 'нет' если хотите закончить",
        );
        const { message: descriptionContinue } =
          await conversation.waitFor("message:text");
        if (descriptionContinue.text.toLowerCase() !== "да") {
          break;
        }
      case "ссылка на изображение":
        await ctx.reply("Введите новую ссылку на изображение");
        const { message: newImageUrl } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ imageUrl: newImageUrl.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply(
          "Ссылка на изображение квиза обновлена. Напишите 'да' если хотите обновить что-то ещё или 'нет' если хотите закончить",
        );
        const { message: imageContinue } = await conversation.waitFor("message:text");
        if (imageContinue.text.toLowerCase() !== "да") {
          break;
        }
      case "популярность":
        await ctx.reply("Введите новую популярность квиза");
        const { message: newIsPopular } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ isPopular: newIsPopular.text === "true" })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply(
          "Популярность квиза обновлена. Напишите 'да' если хотите обновить что-то ещё или 'нет' если хотите закончить",
        );
        const { message: popularContinue } = await conversation.waitFor("message:text");
        if (popularContinue.text.toLowerCase() !== "да") {
          break;
        }
      case "новый":
        await ctx.reply("Введите новую новизну квиза");
        const { message: newIsNew } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ isNew: newIsNew.text === "true" })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply(
          "Новизна квиза обновлена. Напишите 'да' если хотите обновить что-то ещё или 'нет' если хотите закончить",
        );
        const { message: newIsNewContinue } = await conversation.waitFor("message:text");
        if (newIsNewContinue.text.toLowerCase() !== "да") {
          break;
        }
      case "максимальный балл":
        await ctx.reply("Введите новый максимальный балл");
        const { message: newMaxScore } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ maxScore: parseInt(newMaxScore.text) })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply(
          "Максимальный балл квиза обновлен. Напишите 'да' если хотите обновить что-то ещё или 'нет' если хотите закончить",
        );
        const { message: maxScoreContinue } = await conversation.waitFor("message:text");
        if (maxScoreContinue.text.toLowerCase() !== "да") {
          break;
        }
      case "имя коллаборатора":
        await ctx.reply("Введите новое имя коллаборатора");
        const { message: newCollaboratorName } =
          await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ collaboratorName: newCollaboratorName.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply(
          "Имя коллаборатора квиза обновлено. Напишите 'да' если хотите обновить что-то ещё или 'нет' если хотите закончить",
        );
        const { message: collaboratorNameContinue } =
          await conversation.waitFor("message:text");
        if (collaboratorNameContinue.text.toLowerCase() !== "да") {
          break;
        }
      case "логотип коллаборатора":
        await ctx.reply("Введите новый логотип коллаборатора");
        const { message: newCollaboratorLogo } =
          await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ collaboratorLogo: newCollaboratorLogo.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply(
          "Логотип коллаборатора квиза обновлен. Напишите 'да' если хотите обновить что-то ещё или 'нет' если хотите закончить",
        );
        const { message: collaboratorLogoContinue } =
          await conversation.waitFor("message:text");
        if (collaboratorLogoContinue.text.toLowerCase() !== "да") {
          break;
        }
      case "ссылка коллаборатора":
        await ctx.reply("Введите новую ссылку коллаборатора");
        const { message: newCollaboratorLink } =
          await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ collaboratorLink: newCollaboratorLink.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply(
          "Ссылка коллаборатора квиза обновлена. Напишите 'да' если хотите обновить что-то ещё или 'нет' если хотите закончить",
        );
        const { message: collaboratorLinkContinue } =
          await conversation.waitFor("message:text");
        if (collaboratorLinkContinue.text.toLowerCase() !== "да") {
          break;
        }
      default:
        await ctx.reply("Неверный формат, попробуйте снова");
    }
  }
}

bot.use(createConversation(updateQuiz, "update_quiz"));

bot.command("update_quiz", async (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }
  await ctx.conversation.enter("update_quiz");
});

const update = webhookCallback(bot, "std/http");

const handleUpdate = async (request: Request) => {
  return await update(request);
};

export const APIRoute = createAPIFileRoute("/api/admin-bot")({
  GET: async ({ request }) => handleUpdate(request),
  POST: async ({ request }) => handleUpdate(request),
});
