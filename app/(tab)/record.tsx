import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { colors } from '@/constants/colors';
import { Mic, PhoneOff, StopCircle } from 'lucide-react-native';
import { Audio } from 'expo-av';
import { dailyCallManager } from '@/types/daily';
import { DAILY_API_KEY } from '@/constants/daily';
import { dailyService } from '@/services/dailyService';

export default function VoiceChatScreen() {
  const [roomName, setRoomName] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const recordingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Daily.co 클라이언트 초기화
    dailyCallManager.initialize(DAILY_API_KEY).catch(error => {
      console.error('Failed to initialize Daily client:', error);
      Alert.alert('오류', '음성 채팅 초기화에 실패했습니다.');
    });

    return () => {
      if (isInCall) {
        leaveRoom();
      }
      if (recordingTimer.current) {
        clearInterval(recordingTimer.current);
      }
    };
  }, []);

  // 녹음 시간 업데이트 타이머
  useEffect(() => {
    if (isRecording) {
      recordingTimer.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else if (recordingTimer.current) {
      clearInterval(recordingTimer.current);
      recordingTimer.current = null;
      setRecordingDuration(0);
    }
    return () => {
      if (recordingTimer.current) clearInterval(recordingTimer.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('오류', '녹음을 시작할 수 없습니다.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      setIsRecording(false);
      
      // TODO: 녹음 파일 저장 로직 구현
      console.log('Recording saved at:', uri);
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('오류', '녹음을 중지할 수 없습니다.');
    }
  };

  const joinRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('방 이름 입력 필요', '참여할 방 이름을 입력해주세요.');
      return;
    }

    try {
      // 방 생성 또는 가져오기
      const room = await dailyService.getRoom(roomName);
      const token = await dailyService.getRoomToken(roomName, 'User'); // TODO: 사용자 이름 설정

      // Daily.co 방 참여
      await dailyCallManager.joinRoom(room.url, token);
      setIsInCall(true);
      setIsAudioEnabled(true);
      startRecording();
    } catch (error) {
      console.error('Failed to join room:', error);
      Alert.alert('오류', '방 참여에 실패했습니다.');
    }
  };

  const leaveRoom = async () => {
    try {
      await dailyCallManager.leaveRoom();
      setIsInCall(false);
      setRoomName('');
      stopRecording();
    } catch (error) {
      console.error('Failed to leave room:', error);
      Alert.alert('오류', '방을 나가는데 실패했습니다.');
    }
  };

  const toggleAudio = async () => {
    try {
      const newState = !isAudioEnabled;
      await dailyCallManager.setAudioEnabled(newState);
      setIsAudioEnabled(newState);
    } catch (error) {
      console.error('Failed to toggle audio:', error);
      Alert.alert('오류', '오디오 상태를 변경할 수 없습니다.');
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (isInCall) {
    return (
      <View style={styles.container}>
        <View style={styles.callContainer}>
          <Text style={styles.roomName}>방: {roomName}</Text>
          
          {/* 녹음 상태 표시 */}
          <View style={styles.recordingControlsContainer}>
            <Text style={styles.durationText}>
              녹음 중: {formatDuration(recordingDuration)}
            </Text>
            <TouchableOpacity 
              style={styles.stopRecordButton}
              onPress={stopRecording}
            >
              <StopCircle size={40} color={colors.error} fill={colors.error} />
            </TouchableOpacity>
          </View>

          {/* 통화 컨트롤 */}
          <View style={styles.callControls}>
            <TouchableOpacity 
              style={[styles.controlButton, !isAudioEnabled && styles.disabledButton]} 
              onPress={toggleAudio}
            >
              <Mic 
                size={24} 
                color={isAudioEnabled ? colors.text : colors.error} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.controlButton, styles.endCallButton]} 
              onPress={leaveRoom}
            >
              <PhoneOff size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Voice Chat & Record</Text>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="참여할 방 이름 입력"
          value={roomName}
          onChangeText={setRoomName}
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity
          style={styles.joinButton}
          onPress={joinRoom}
          disabled={!roomName.trim()}
        >
          <Text style={styles.joinButtonText}>참여하기 및 녹음 시작</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
  },
  inputContainer: {
    padding: 16,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    padding: 12,
    color: colors.text,
    marginBottom: 16,
  },
  joinButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  joinButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
  },
  callContainer: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 16,
  },
  roomName: {
    fontSize: 18,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  recordingControlsContainer: {
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    marginBottom: 16,
  },
  durationText: {
    fontSize: 18,
    color: colors.text,
    marginBottom: 10,
  },
  stopRecordButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  callControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 16,
    gap: 16,
  },
  controlButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: colors.error,
  },
  endCallButton: {
    backgroundColor: colors.error,
  },
});