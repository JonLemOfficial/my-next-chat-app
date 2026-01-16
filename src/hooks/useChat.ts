import type { User } from '@/types/user';
import type { Message } from '@/types/message';
import type { Chat } from '@/types/chat';

import { createContext, useContext } from 'react';

export interface ChatContextType {
  currentUser: User | null;
  users: User[];
  chats: Map<string, Chat>;
  activeChat: Chat | null;
  setActiveChatUser: (user: User | null) => void;
  // setActiveChatMessages: (sender: number, receiver: number) => void;
  // messages: Message[];
  sendMessage: (text: string) => void;
}

export const ChatContext = createContext<ChatContextType | null>(null);

export const useChat = () => {
  const context = useContext(ChatContext);
  if ( ! context ) {
    throw new Error('useChat must be used within a ChatProvider');
  }

  return context;
};
