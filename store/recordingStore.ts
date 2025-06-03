import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recording } from '@/types';

interface RecordingState {
  recordings: Recording[];
  addRecording: (recording: Omit<Recording, 'id' | 'createdAt'>) => void;
  deleteRecording: (id: string) => void;
  getRecordingsForSong: (songId: string) => Recording[];
}

export const useRecordingStore = create<RecordingState>()(
  persist(
    (set, get) => ({
      recordings: [],
      addRecording: (recordingData) => {
        const now = Date.now();
        const newRecording: Recording = {
          id: `recording-${now}-${Math.random().toString(36).substring(2, 9)}`,
          createdAt: now,
          ...recordingData,
        };
        
        set((state) => ({
          recordings: [...state.recordings, newRecording],
        }));
      },
      deleteRecording: (id) => {
        set((state) => ({
          recordings: state.recordings.filter((recording) => recording.id !== id),
        }));
      },
      getRecordingsForSong: (songId) => {
        return get().recordings.filter((recording) => recording.songId === songId);
      },
    }),
    {
      name: 'recording-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);