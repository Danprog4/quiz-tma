import {
  Conversation,
  conversations,
  createConversation,
  type ConversationFlavor,
} from "@grammyjs/conversations";
import { createAPIFileRoute } from "@tanstack/react-start/api";
import { Bot, Context, webhookCallback } from "grammy";
import { db } from "~/lib/db";
import { newsTable, quizzesTable } from "~/lib/db/schema";
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
  ] = message.text.split(",");

  await db.insert(quizzesTable).values({
    title,
    category,
    description,
    imageUrl,
    isPopular: isPopular === "true",
    isNew: isNew === "true",
    maxScore: maxScore ? parseInt(maxScore) : 0,
    collaboratorName: collaboratorName || null,
    collaboratorLogo: collaboratorLogo || null,
    collaboratorLink: collaboratorLink || null,
  });
  await ctx.reply("Квиз создан успешно");
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
