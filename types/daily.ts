import { NativeModules } from 'react-native';

interface DailyCallManagerInterface {
  initialize(apiKey: string): Promise<boolean>;
  joinRoom(roomUrl: string, token?: string): Promise<boolean>;
  leaveRoom(): Promise<boolean>;
  setAudioEnabled(enabled: boolean): Promise<boolean>;
}

const { DailyCallManager } = NativeModules;

export const dailyCallManager = DailyCallManager as DailyCallManagerInterface;

export interface DailyParticipant {
  id: string;
  userName: string;
  isLocal: boolean;
  isAudioEnabled: boolean;
}

export interface DailyRoomState {
  participants: Record<string, DailyParticipant>;
  isAudioEnabled: boolean;
  isConnected: boolean;
} 