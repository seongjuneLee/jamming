import React from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { AgoraServiceInterface } from './agoraService';
import { AGORA_APP_ID } from '@/constants/agora';

export class AgoraWebService implements AgoraServiceInterface {
  private webViewRef: React.RefObject<WebView | null>;
  private onError?: (error: string) => void;
  private onUserJoined?: (uid: number) => void;
  private onUserLeft?: (uid: number) => void;

  constructor(
    webViewRef: React.RefObject<WebView | null>,
    callbacks?: {
      onError?: (error: string) => void;
      onUserJoined?: (uid: number) => void;
      onUserLeft?: (uid: number) => void;
    }
  ) {
    this.webViewRef = webViewRef;
    this.onError = callbacks?.onError;
    this.onUserJoined = callbacks?.onUserJoined;
    this.onUserLeft = callbacks?.onUserLeft;
  }

  async initialize(): Promise<void> {
    // Web SDK는 WebView 내에서 초기화되므로 여기서는 아무것도 하지 않음
  }

  async joinChannel(channelName: string): Promise<void> {
    // 토큰 없이 App ID와 채널 이름으로 join 시도
    this.webViewRef.current?.injectJavaScript(`
      window.postMessage(JSON.stringify({
        type: 'join',
        appId: '${AGORA_APP_ID}',
        channelName: '${channelName}',
        token: null, // 개발용 토큰 사용 안 함
        uid: null // Agora에서 자동 생성
      }), '*');
    `);
  }

  async leaveChannel(): Promise<void> {
    this.webViewRef.current?.injectJavaScript(`
      window.postMessage(JSON.stringify({ type: 'leave' }), '*');
    `);
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    this.webViewRef.current?.injectJavaScript(`
      window.postMessage(JSON.stringify({
        type: 'toggleAudio',
        enabled: ${enabled}
      }), '*');
    `);
  }

  release(): void {
    // Web SDK는 WebView가 언마운트될 때 자동으로 정리됨
  }

  handleWebViewMessage(event: WebViewMessageEvent): void {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      switch (data.type) {
        case 'error':
          this.onError?.(data.error);
          break;
        case 'userJoined':
          this.onUserJoined?.(data.uid);
          break;
        case 'userLeft':
          this.onUserLeft?.(data.uid);
          break;
      }
    } catch (error) {
      console.error('WebView message error:', error);
    }
  }

  getWebViewHTML(): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script src="https://download.agora.io/sdk/release/AgoraRTC_N-4.20.0.js"></script>
        <style>
          body { margin: 0; padding: 0; background: transparent; }
          #container { width: 100%; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="container"></div>
        <script>
          let client = null;
          let localAudioTrack = null;

          window.initializeAgora = async (appId, channelName, token, uid) => {
            try {
              client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
              
              client.on("user-published", async (user, mediaType) => {
                await client.subscribe(user, mediaType);
                if (mediaType === "audio") {
                  user.audioTrack.play();
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'userJoined',
                    uid: user.uid
                  }));
                }
              });

              client.on("user-unpublished", (user) => {
                if (user.audioTrack) {
                  user.audioTrack.stop();
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'userLeft',
                    uid: user.uid
                  }));
                }
              });

              // 토큰 없이 join 시도 (개발용)
              await client.join(appId, channelName, token, uid);
              localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
              await client.publish([localAudioTrack]);

              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'joined',
                success: true
              }));
            } catch (error) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'error',
                error: error.message
              }));
            }
          };

          window.leaveChannel = async () => {
            if (localAudioTrack) {
              localAudioTrack.close();
            }
            if (client) {
              await client.leave();
            }
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'left'
            }));
          };

          window.toggleAudio = (enabled) => {
            if (localAudioTrack) {
              localAudioTrack.setEnabled(enabled);
            }
          };

          window.addEventListener('message', async (event) => {
            const data = JSON.parse(event.data);
            switch (data.type) {
              case 'join':
                // 토큰과 UID는 null 또는 undefined로 전달
                await window.initializeAgora(data.appId, data.channelName, data.token, data.uid);
                break;
              case 'leave':
                await window.leaveChannel();
                break;
              case 'toggleAudio':
                window.toggleAudio(data.enabled);
                break;
            }
          });
        </script>
      </body>
      </html>
    `;
  }
} 