export type ChatSummary = {
  chatId: string;
  matchStatus: string;
  otherUser: {
    name: string;
    photos: string[];
  };
};

export type ChatMessage = {
  messageId: number;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
};

export type ChatDetail = {
  chatId: string;
  user1Id: string;
  user2Id: string;
  matchRequester: string | null;
  matchStatus: string;
  meetSuccessUser1: boolean;
  meetSuccessUser2: boolean;
  otherUser: {
    userId: string;
    name: string;
    photos: string[];
    height?: string;
    age?: string;
    location?: string;
  };
};
