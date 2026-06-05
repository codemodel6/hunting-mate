import ChatPage from "@/views/chat";

export default function Page({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  return <ChatPage params={params} />;
}

