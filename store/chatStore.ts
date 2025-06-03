import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ChatMessage } from '@/types';

interface ChatState {
  messages: ChatMessage[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  deleteMessage: (id: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      addMessage: (messageData) => {
        const now = Date.now();
        const newMessage: ChatMessage = {
          id: `msg-${now}-${Math.random().toString(36).substring(2, 9)}`,
          timestamp: now,
          ...messageData,
        };
        
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      },
      deleteMessage: (id) => {
        set((state) => ({
          messages: state.messages.filter((message) => message.id !== id),
        }));
      },
    }),
    {
      name: 'chat-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);