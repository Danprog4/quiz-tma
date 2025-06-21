import { createAPIFileRoute } from "@tanstack/react-start/api";
import { Bot, webhookCallback } from "grammy";
import { db } from "~/lib/db";
import { newsTable } from "~/lib/db/schema";
import { getIsAdmin } from "~/lib/utils/getIsAdmin";

const bot = new Bot(process.env.ADMIN_BOT_TOKEN as string);

bot.command("start", (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  ctx.reply("Привет, Админ!");
});

bot.command("create-news", (ctx) => {
  if (!getIsAdmin(Number(ctx.from?.id))) {
    ctx.reply("У тебя нет доступа к этому боту");
    return;
  }

  ctx.reply(
    "Введите текст новости, ссылку и ссылку на изображение. Формат: блаблабла,ссылка,ссылка",
  );

  bot.on("message", async (ctx) => {
    const response = ctx.message?.text && ctx.message.text.split(",");
    if (response) {
      const [text, link, imageUrl] = response;
      await db.insert(newsTable).values({ text, link, imageUrl });
      ctx.reply("Новость создана успешно");
    } else {
      ctx.reply("Неверный формат");
    }
  });
});

const update = webhookCallback(bot, "std/http");

const handleUpdate = async (request: Request) => {
  return await update(request);
};

export const APIRoute = createAPIFileRoute("/api/admin-bot")({
  GET: async ({ request }) => handleUpdate(request),
  POST: async ({ request }) => handleUpdate(request),
});
