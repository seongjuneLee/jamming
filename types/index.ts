export type SongStatus = 'to-practice' | 'in-progress' | 'completed';

export interface Song {
  id: string;
  title: string;
  artist: string;
  status: SongStatus;
  progress: number; // 0-100
  recordings: Recording[];
  aiEvaluation?: string;
  createdAt: number;
  updatedAt: number;
  // New fields
  bpm?: number;
  timeSignature?: string;
  instruments?: string[];
  chords?: string[];
  key?: string;
}

export interface Recording {
  id: string;
  songId: string;
  name: string;
  uri: string;
  duration: number;
  createdBy: string;
  createdAt: number;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  description?: string;
  startTime: number;
  endTime: number;
  location?: string;
  createdAt: number;
  updatedAt: number;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
}