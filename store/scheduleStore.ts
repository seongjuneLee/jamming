import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ScheduleEvent } from '@/types';

interface ScheduleState {
  events: ScheduleEvent[];
  addEvent: (event: Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateEvent: (id: string, eventData: Partial<Omit<ScheduleEvent, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  deleteEvent: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set) => ({
      events: [],
      addEvent: (eventData) => {
        const now = Date.now();
        const newEvent: ScheduleEvent = {
          id: `event-${now}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: now,
          updatedAt: now,
          ...eventData,
        };
        
        set((state) => ({
          events: [...state.events, newEvent],
        }));
      },
      updateEvent: (id, eventData) => {
        set((state) => ({
          events: state.events.map((event) => 
            event.id === id 
              ? { ...event, ...eventData, updatedAt: Date.now() } 
              : event
          ),
        }));
      },
      deleteEvent: (id) => {
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
        }));
      },
    }),
    {
      name: 'schedule-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);