import RtcEngine, { RtcConnection } from 'react-native-agora';
import { AgoraServiceInterface } from './agoraService';
import { AGORA_APP_ID, CHANNEL_PROFILE, CLIENT_ROLE, AUDIO_PROFILE, AUDIO_SCENARIO } from '@/constants/agora';

export class AgoraNativeService implements AgoraServiceInterface {
  private engine: typeof RtcEngine | null = null;
  private onError?: (error: string) => void;
  private onUserJoined?: (uid: number) => void;
  private onUserLeft?: (uid: number) => void;

  constructor(
    callbacks?: {
      onError?: (error: string) => void;
      onUserJoined?: (uid: number) => void;
      onUserLeft?: (uid: number) => void;
    }
  ) {
    this.onError = callbacks?.onError;
    this.onUserJoined = callbacks?.onUserJoined;
    this.onUserLeft = callbacks?.onUserLeft;
  }

  async initialize(): Promise<void> {
    try {
      this.engine = RtcEngine();
      await this.engine.initialize({
        appId: AGORA_APP_ID,
        channelProfile: CHANNEL_PROFILE.COMMUNICATION,
      });

      await this.engine.enableAudio();
      await this.engine.setChannelProfile(CHANNEL_PROFILE.COMMUNICATION);
      await this.engine.setClientRole(CLIENT_ROLE.BROADCASTER);
      await this.engine.setAudioProfile(
        AUDIO_PROFILE.MUSIC_HIGH_QUALITY_STEREO,
        AUDIO_SCENARIO.CHATROOM_ENTERTAINMENT
      );

      this.setupEventListeners();
    } catch (error) {
      throw new Error('Agora 초기화 실패: ' + error);
    }
  }

  private setupEventListeners(): void {
    if (!this.engine) return;

    this.engine.addListener('onError', (err: number) => {
      this.onError?.(`통화 중 오류 발생: ${err}`);
    });

    this.engine.addListener('onUserJoined', (connection: RtcConnection, remoteUid: number) => {
      this.onUserJoined?.(remoteUid);
    });

    this.engine.addListener('onUserOffline', (connection: RtcConnection, remoteUid: number) => {
      this.onUserLeft?.(remoteUid);
    });
  }

  async joinChannel(channelName: string): Promise<void> {
    if (!this.engine) {
      throw new Error('Agora 엔진이 초기화되지 않았습니다.');
    }

    try {
      await this.engine.joinChannel('', channelName, '', 0);
    } catch (error) {
      throw new Error('방 참여 실패: ' + error);
    }
  }

  async leaveChannel(): Promise<void> {
    if (!this.engine) return;

    try {
      await this.engine.leaveChannel();
    } catch (error) {
      throw new Error('방 퇴장 실패: ' + error);
    }
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (!this.engine) return;

    try {
      await this.engine.muteLocalAudioStream(!enabled);
    } catch (error) {
      throw new Error('오디오 상태 변경 실패: ' + error);
    }
  }

  release(): void {
    if (this.engine) {
      this.engine.release();
      this.engine = null;
    }
  }
} 