import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Song, SongStatus } from '@/types';

interface SongState {
  songs: Song[];
  addSong: (song: Omit<Song, 'id' | 'createdAt' | 'updatedAt' | 'recordings' | 'progress'>) => void;
  updateSongStatus: (id: string, status: SongStatus) => void;
  updateSongProgress: (id: string, progress: number) => void;
  updateSongAiEvaluation: (id: string, evaluation: string) => void;
  updateSongDetails: (id: string, details: Partial<Song>) => void;
  deleteSong: (id: string) => void;
}

export const useSongStore = create<SongState>()(
  persist(
    (set) => ({
      songs: [],
      addSong: (songData) => {
        const now = Date.now();
        const newSong: Song = {
          id: `song-${now}-${Math.random().toString(36).substring(2, 9)}`,
          progress: 0,
          recordings: [],
          createdAt: now,
          updatedAt: now,
          ...songData,
        };
        
        set((state) => ({
          songs: [...state.songs, newSong],
        }));
      },
      updateSongStatus: (id, status) => {
        set((state) => ({
          songs: state.songs.map((song) => 
            song.id === id 
              ? { ...song, status, updatedAt: Date.now() } 
              : song
          ),
        }));
      },
      updateSongProgress: (id, progress) => {
        set((state) => ({
          songs: state.songs.map((song) => 
            song.id === id 
              ? { ...song, progress, updatedAt: Date.now() } 
              : song
          ),
        }));
      },
      updateSongAiEvaluation: (id, evaluation) => {
        set((state) => ({
          songs: state.songs.map((song) => 
            song.id === id 
              ? { ...song, aiEvaluation: evaluation, updatedAt: Date.now() } 
              : song
          ),
        }));
      },
      updateSongDetails: (id, details) => {
        set((state) => ({
          songs: state.songs.map((song) => 
            song.id === id 
              ? { ...song, ...details, updatedAt: Date.now() } 
              : song
          ),
        }));
      },
      deleteSong: (id) => {
        set((state) => ({
          songs: state.songs.filter((song) => song.id !== id),
        }));
      },
    }),
    {
      name: 'song-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);