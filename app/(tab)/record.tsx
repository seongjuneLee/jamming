import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Platform, Alert } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { AgoraServiceInterface } from '@/services/agoraService';
import { AgoraWebService } from '@/services/agoraWebService';
import Constants from 'expo-constants';
import { getNativeService } from '@/services/agoraNativeLoader';
import { AGORA_APP_ID } from '@/constants/agora'; // Agora App ID 임포트

// 로컬 토큰 서버 주소 (개발 환경)
const TOKEN_SERVER_URL = Platform.select({
  ios: Constants.executionEnvironment === 'storeClient' ? 'http://192.168.0.101:8080' : 'http://localhost:8080', // 실제 기기는 로컬 IP, 시뮬레이터는 localhost
  android: 'http://10.0.2.2:8080', // Android 에뮬레이터
  web: 'http://localhost:8080', // 웹 브라우저
  default: 'http://localhost:8080', // 기타 환경
});

// 사용자 UID 생성 (임시)
const uid = Math.floor(Math.random() * 1000000);

export default function RecordScreen() {
  const [roomName, setRoomName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeUsers, setActiveUsers] = useState<number[]>([]);

  const agoraService = useRef<AgoraServiceInterface | null>(null);
  const webViewRef = useRef<WebView | null>(null);

  useEffect(() => {
    // 플랫폼 및 실행 환경에 따라 적절한 서비스 초기화
    const isExpoGo = Constants.executionEnvironment === 'storeClient';

    if (Platform.OS === 'web' || isExpoGo) {
      // 웹 또는 Expo Go 환경에서는 WebView 기반 웹 서비스 사용
      agoraService.current = new AgoraWebService(webViewRef, {
        onError: (error: string) => {
          setError(error);
          Alert.alert('오류', error);
        },
        onUserJoined: (uid: number) => {
          setActiveUsers(prev => [...prev, uid]);
        },
        onUserLeft: (uid: number) => {
          setActiveUsers(prev => prev.filter(id => id !== uid));
        }
      });
    } else {
      // 네이티브 빌드 환경에서는 네이티브 서비스 사용
      agoraService.current = getNativeService();
      // 네이티브 서비스 초기화 시 콜백 등록 필요
      if (agoraService.current && agoraService.current instanceof (require('@/services/agoraNativeLoader').AgoraNativeServiceInternal)) { // 타입 가드
         (agoraService.current as any).onError = (error: string) => {
            setError(error);
            Alert.alert('오류', error);
          };
          (agoraService.current as any).onUserJoined = (uid: number) => {
            setActiveUsers(prev => [...prev, uid]);
          };
          (agoraService.current as any).onUserLeft = (uid: number) => {
            setActiveUsers(prev => prev.filter(id => id !== uid));
          };
      }

    }

    return () => {
      agoraService.current?.release();
    };
  }, []);

  // 토큰 서버로부터 토큰을 가져오는 함수
  const fetchToken = async (channelName: string, currentUid: number): Promise<string | null> => {
    try {
      const response = await fetch(`${TOKEN_SERVER_URL}/rtc/${channelName}/publisher/${currentUid}`);
      if (!response.ok) {
        throw new Error(`토큰 가져오기 실패: ${response.status}`);
      }
      const data = await response.json();
      return data.rtcToken;
    } catch (error) {
      console.error('토큰 가져오기 오류:', error);
      Alert.alert('오류', '토큰을 가져오는데 실패했습니다. 토큰 서버가 실행 중인지 확인하세요.');
      return null;
    }
  };

  const handleJoinRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('알림', '방 이름을 입력해주세요.');
      return;
    }

    try {
      // 토큰 가져오기 (현재 사용자 UID 포함)
      const token = await fetchToken(roomName, uid);
      if (!token) {
        return; // 토큰 가져오기 실패 시 중단
      }

      await agoraService.current?.initialize();

      // 플랫폼 및 실행 환경에 따라 적절한 서비스 호출
      const isExpoGo = Constants.executionEnvironment === 'storeClient';
      if ((Platform.OS === 'web' || isExpoGo) && agoraService.current instanceof AgoraWebService) {
         // WebView 내 HTML 코드에 토큰 전달
         webViewRef.current?.injectJavaScript(`
           window.postMessage(JSON.stringify({
             type: 'join',
             appId: '${AGORA_APP_ID}', // <-- 올바른 App ID 사용
             channelName: '${roomName}',
             uid: ${uid},
             token: '${token}'
           }), '*');
         `);
      } else if (agoraService.current) {
         // 네이티브 서비스의 joinChannel 메서드 호출 (토큰 포함)
         // Agora Native SDK의 joinChannelWithToken 메서드 사용
         await (agoraService.current as any).joinChannelWithToken(token, roomName, '', uid);
      }

      setIsJoined(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      Alert.alert('오류', err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleLeaveRoom = async () => {
    try {
      await agoraService.current?.leaveChannel();
      setIsJoined(false);
      setActiveUsers([]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      Alert.alert('오류', err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleToggleAudio = async () => {
    try {
      await agoraService.current?.toggleAudio(!isMuted);
      setIsMuted(!isMuted);
    } catch (err) {
      setError(err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
      Alert.alert('오류', err instanceof Error ? err.message : '알 수 없는 오류가 발생했습니다.');
    }
  };

  const handleWebViewMessage = (event: WebViewMessageEvent) => {
    if (agoraService.current instanceof AgoraWebService) {
      agoraService.current.handleWebViewMessage(event);
    }
  };

  return (
    <View style={styles.container}>
      {(Platform.OS === 'web' || Constants.executionEnvironment === 'storeClient') && (
        <WebView
          ref={webViewRef}
          source={{ html: (agoraService.current as AgoraWebService)?.getWebViewHTML() }}
          onMessage={handleWebViewMessage}
          style={styles.webview}
          mediaPlaybackRequiresUserAction={false}
        />
      )}

      <View style={styles.controls}>
        {!isJoined ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="방 이름을 입력하세요"
              value={roomName}
              onChangeText={setRoomName}
            />
            <TouchableOpacity style={styles.button} onPress={handleJoinRoom}>
              <Text style={styles.buttonText}>참여하기</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.roomInfo}>방 이름: {roomName}</Text>
            <Text style={styles.userInfo}>참여자 수: {activeUsers.length + 1}</Text>
            <TouchableOpacity
              style={[styles.button, isMuted && styles.buttonMuted]}
              onPress={handleToggleAudio}
            >
              <Text style={styles.buttonText}>
                {isMuted ? '음소거 해제' : '음소거'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.buttonLeave]}
              onPress={handleLeaveRoom}
            >
              <Text style={styles.buttonText}>나가기</Text>
            </TouchableOpacity>
          </>
        )}
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  controls: {
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonMuted: {
    backgroundColor: '#FF3B30',
  },
  buttonLeave: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roomInfo: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 16,
    marginBottom: 20,
  },
  error: {
    color: '#FF3B30',
    marginTop: 10,
  },
});