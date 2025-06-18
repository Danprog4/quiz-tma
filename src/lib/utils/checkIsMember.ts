import axios from "axios";

export async function checkTelegramMembership(args: {
  userId: number;
  chatId: string;
}): Promise<boolean> {
  const { userId, chatId } = args;
  const response = await axios.get<{ result: { status: string } }>(
    `https://api.telegram.org/bot${process.env.BOT_TOKEN}/getChatMember`,
    {
      params: {
        chat_id: chatId.toString().startsWith("-") ? chatId : "@" + chatId,
        user_id: userId,
      },
    },
  );

  console.log("check membership response", response.data.result.status);

  return (
    response.data.result.status === "member" ||
    response.data.result.status === "administrator" ||
    response.data.result.status === "creator"
  );
}
