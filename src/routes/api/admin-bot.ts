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
    "Введите текст новости, ссылку на ресурс и ссылку на изображение. Формат: блаблабла; ссылка; ссылка",
  );

  const { message } = await conversation.waitFor("message:text");
  console.log(message);
  const [text, link, imageUrl] = message.text.split(";").map((item) => item.trim());
  try {
    await db.insert(newsTable).values({ text, link, imageUrl });
    await ctx.reply("Новость создана успешно");
  } catch (error) {
    console.error(error, "error");
    await ctx.reply("Не удалось создать новость");
  }
}

async function deleteNews(conversation: Conversation, ctx: Context) {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  await ctx.reply("Введите ID или название новости, которую хотите удалить:");

  let news;
  while (true) {
    const { message } = await conversation.waitFor("message:text");
    const response = message.text.toLowerCase().trim();

    const idAsNumber = parseInt(response);
    const isValidId = !isNaN(idAsNumber);

    news = await db.query.newsTable.findFirst({
      where: isValidId ? eq(newsTable.id, idAsNumber) : eq(newsTable.text, response),
    });

    if (!news) {
      await ctx.reply("Новость не найдена, попробуйте ввести ID или название еще раз");
      continue;
    } else {
      break;
    }
  }

  await db.delete(newsTable).where(eq(newsTable.id, news.id));
  await ctx.reply("Новость удалена");
}

bot.command("get_news", async (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  const news = await db.query.newsTable.findMany();
  await ctx.reply(news.map((news) => `${news.id}. ${news.text}`).join("\n"));
});

bot.use(createConversation(deleteNews, "delete_news"));

bot.command("delete_news", async (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }
  await ctx.conversation.enter("delete_news");
});

bot.use(createConversation(createNews, "create_news"));

bot.command("create_news", async (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }
  await ctx.conversation.enter("create_news");
});

async function createQuiz(conversation: Conversation, ctx: Context) {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  await ctx.reply(
    "Введите данные квиза в формате: название; категория; описание; ссылка на изображение; популярный (true/false); новый (true/false); максимальный балл; имя коллаборатора; логотип коллаборатора; ссылка коллаборатора",
  );

  const { message } = await conversation.waitFor("message:text");
  const parts = message.text.split(";");

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
      `Создай вопрос #${questionCount + 1} для квиза "${title}". В формате: вопрос; тип презентации (text/photo/video/audio); ссылка на медиа (или пустое); объяснение; баллы`,
    );

    let questionMessage;
    let questionParts;

    // Повторяем пока не получим правильный формат
    while (true) {
      const response = await conversation.waitFor("message:text");
      questionMessage = response.message;
      questionParts = questionMessage.text.split(";");

      if (questionParts.length >= 5) {
        break;
      }

      await ctx.reply(
        "Неверный формат вопроса. Попробуйте снова. Формат: вопрос; тип презентации (text/photo/video/audio); ссылка на медиа (или пустое); объяснение; баллы",
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
        `Создай ответ #${answerCount + 1} для вопроса "${questionText}". В формате: текст ответа; правильный (true/false). Напиши "нет" если хочешь закончить создание вопроса`,
      );

      const { message: response } = await conversation.waitFor("message:text");
      if (response.text.toLowerCase() === "нет") {
        break;
      }

      let answerMessage;
      let answerParts;

      // Повторяем пока не получим правильный формат
      while (true) {
        const response = await conversation.waitFor("message:text");
        answerMessage = response.message;
        answerParts = answerMessage.text.split(";");

        if (answerParts.length >= 2) {
          break;
        }

        await ctx.reply(
          "Неверный формат ответа. Попробуйте снова. Формат: текст ответа; правильный (true/false)",
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
    const response = message.text.toLowerCase().trim();

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
      "Введите что хотите обновить. Если больше не хотите обновлять, введите 'нет'. Например, название, описание, ссылка на изображение, популярность, новый, максимальный балл, имя коллаборатора, логотип коллаборатора, ссылка коллаборатора. Можно ввести только одно поле",
    );

    const { message } = await conversation.waitFor("message:text");
    const update = message.text.toLowerCase().trim();

    if (update === "нет") {
      break;
    }

    switch (update) {
      case "название":
        await ctx.reply("Введите новое название квиза");
        const { message: newTitle } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ title: newTitle.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply("Название квиза обновлено");
        break;

      case "описание":
        await ctx.reply("Введите новое описание квиза");
        const { message: newDescription } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ description: newDescription.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply("Описание квиза обновлено");
        break;

      case "ссылка на изображение":
        await ctx.reply("Введите новую ссылку на изображение");
        const { message: newImageUrl } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ imageUrl: newImageUrl.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply("Ссылка на изображение квиза обновлена");
        break;

      case "популярность":
        await ctx.reply("Введите новую популярность квиза");
        const { message: newIsPopular } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ isPopular: newIsPopular.text === "true" })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply("Популярность квиза обновлена");
        break;

      case "новый":
        await ctx.reply("Введите новую новизну квиза");
        const { message: newIsNew } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ isNew: newIsNew.text === "true" })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply("Новизна квиза обновлена");
        break;

      case "максимальный балл":
        await ctx.reply("Введите новый максимальный балл");
        const { message: newMaxScore } = await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ maxScore: parseInt(newMaxScore.text) })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply("Максимальный балл квиза обновлен");
        break;

      case "имя коллаборатора":
        await ctx.reply("Введите новое имя коллаборатора");
        const { message: newCollaboratorName } =
          await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ collaboratorName: newCollaboratorName.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply("Имя коллаборатора квиза обновлено");
        break;

      case "логотип коллаборатора":
        await ctx.reply("Введите новый логотип коллаборатора");
        const { message: newCollaboratorLogo } =
          await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ collaboratorLogo: newCollaboratorLogo.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply("Логотип коллаборатора квиза обновлен");
        break;

      case "ссылка коллаборатора":
        await ctx.reply("Введите новую ссылку коллаборатора");
        const { message: newCollaboratorLink } =
          await conversation.waitFor("message:text");
        await db
          .update(quizzesTable)
          .set({ collaboratorLink: newCollaboratorLink.text })
          .where(eq(quizzesTable.id, quiz.id));
        await ctx.reply("Ссылка коллаборатора квиза обновлена");
        break;
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

async function deleteQuiz(conversation: Conversation, ctx: Context) {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  await ctx.reply("Введите ID или название квиза, который хотите удалить:");

  let quiz;
  while (true) {
    const { message } = await conversation.waitFor("message:text");
    const response = message.text.toLowerCase().trim();

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

  if (!quiz) {
    await ctx.reply("Что-то пошло не так, попробуйте снова");
    return;
  }

  await db.delete(quizzesTable).where(eq(quizzesTable.id, quiz.id));
  await ctx.reply("Квиз удален");
}

bot.use(createConversation(deleteQuiz, "delete_quiz"));

bot.command("delete_quiz", async (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }
  await ctx.conversation.enter("delete_quiz");
});

bot.command("get_quizzes", async (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  await ctx.api.sendChatAction(ctx.chat.id, "typing");
  const quizzes = await db.query.quizzesTable.findMany();
  await ctx.reply(quizzes.map((quiz) => `${quiz.id}. ${quiz.title}`).join("\n"));
});

const update = webhookCallback(bot, "std/http");

const handleUpdate = async (request: Request) => {
  return await update(request);
};

export const APIRoute = createAPIFileRoute("/api/admin-bot")({
  GET: async ({ request }) => handleUpdate(request),
  POST: async ({ request }) => handleUpdate(request),
});
