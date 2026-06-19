"use client";

import { use } from "react";

import ChatExperience from "@/widgets/chat-experience";

export default function ChatPage({
  params,
}: {
  params: Promise<{ chatId: string }>;
}) {
  const { chatId } = use(params);
  return <ChatExperience mobileView="detail" selectedChatId={chatId} />;
}
