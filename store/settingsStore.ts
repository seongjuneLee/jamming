import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  metronomeSettings: {
    tempo: number;
    timeSignature: string;
    sound: string;
    isPlaying: boolean;
  };
  updateMetronomeSettings: (settings: Partial<SettingsState['metronomeSettings']>) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      metronomeSettings: {
        tempo: 120,
        timeSignature: '4/4',
        sound: 'click',
        isPlaying: false,
      },
      updateMetronomeSettings: (settings) => {
        set((state) => ({
          metronomeSettings: {
            ...state.metronomeSettings,
            ...settings,
          },
        }));
      },
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);