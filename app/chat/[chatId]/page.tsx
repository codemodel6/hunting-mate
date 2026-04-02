import ChatPage from "../../pages/ChatPage";

export default async function Page({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = await params;

  return <ChatPage chatId={chatId} />;
}
