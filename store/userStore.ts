import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types';

interface UserState {
  currentUser: User | null;
  bandMembers: User[];
  setCurrentUser: (user: User) => void;
  addBandMember: (member: User) => void;
  removeBandMember: (id: string) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      currentUser: null,
      bandMembers: [],
      setCurrentUser: (user) => {
        set({ currentUser: user });
      },
      addBandMember: (member) => {
        set((state) => ({
          bandMembers: [...state.bandMembers, member],
        }));
      },
      removeBandMember: (id) => {
        set((state) => ({
          bandMembers: state.bandMembers.filter((member) => member.id !== id),
        }));
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);