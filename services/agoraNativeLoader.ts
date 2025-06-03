import { AgoraServiceInterface } from './agoraService';
import { AGORA_APP_ID, CHANNEL_PROFILE, CLIENT_ROLE, AUDIO_PROFILE, AUDIO_SCENARIO } from '@/constants/agora';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// 네이티브 모듈은 네이티브 환경에서만 로드되도록 조건부 임포트
let RtcEngine: any;
let RtcConnection: any;

const isExpoGo = Constants.executionEnvironment === 'storeClient';

if (Platform.OS !== 'web' && !isExpoGo) {
  // 네이티브 빌드 환경에서만 네이티브 모듈 임포트
  try {
    const AgoraNative = require('react-native-agora');
    RtcEngine = AgoraNative.default;
    RtcConnection = AgoraNative.RtcConnection;

    class AgoraNativeServiceInternal implements AgoraServiceInterface {
      private engine: any = null; // 타입을 any로 변경
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

        this.engine.addListener('onUserJoined', (connection: any, remoteUid: number) => {
          this.onUserJoined?.(remoteUid);
        });

        this.engine.addListener('onUserOffline', (connection: any, remoteUid: number) => {
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

    // 네이티브 서비스 로더 함수
    (getNativeService as any) = () => new AgoraNativeServiceInternal();

  } catch (e) {
    console.error('Failed to load react-native-agora', e);
    // Expo Go 또는 웹 환경에서는 네이티브 서비스가 null이 되도록 유지
    (getNativeService as any) = () => null;
  }
} else {
   // Expo Go 또는 웹 환경에서는 네이티브 서비스가 null이 되도록 유지
  (getNativeService as any) = () => null;
}

export function getNativeService(): AgoraServiceInterface | null {
   return null; // 기본값 (실제 로직은 조건문 안에서 할당)
} 