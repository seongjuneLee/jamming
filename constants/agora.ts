// Agora App ID
export const AGORA_APP_ID = 'a90809bf061246f9b527452254a31860';

// Agora RTC 엔진 설정 (오디오 관련)
export const AGORA_RTC_ENGINE_CONFIG = {
  // 오디오 프로필 설정 (예: 통신, 음악)
  // https://docs.agora.io/en/Voice/API%20Reference/react-native/API/rtc_api_setaudioprofile.html
  audioProfile: 0, // 0: default, 1: communication, 2: music standard, 3: music standard stereo, 4: music high quality, 5: music high quality stereo

  // 오디오 시나리오 설정 (예: 채팅, 게임 미디어, 고음질 음악)
  // https://docs.agora.io/en/Voice/API%20Reference/react-native/API/rtc_api_setaudioscenario.html
  audioScenario: 0, // 0: default, 1: chatroom gaming, 2: high quality chatroom, 3: leading role for high quality chatroom, 4: game streaming, 5: show room, 6: pure music

  // 기타 오디오 설정 (필요에 따라 추가)
  enableAudioVolumeIndication: 1000, // 1000ms 마다 볼륨 레벨 알림
};

// 채널 프로필 설정
export const CHANNEL_PROFILE = {
  COMMUNICATION: 0, // 1:1 또는 그룹 통화
  LIVE_BROADCASTING: 1, // 라이브 방송
};

// 클라이언트 역할 설정
export const CLIENT_ROLE = {
  BROADCASTER: 1, // 방송자 (오디오/비디오 송출)
  AUDIENCE: 2, // 시청자 (오디오/비디오 수신만)
};

// 오디오 프로필 설정
export const AUDIO_PROFILE = {
  DEFAULT: 0, // 기본 프로필
  SPEECH_STANDARD: 1, // 음성 통화 최적화
  MUSIC_STANDARD: 2, // 음악 스트리밍 최적화
  MUSIC_STANDARD_STEREO: 3, // 스테레오 음악 스트리밍
  MUSIC_HIGH_QUALITY: 4, // 고품질 음악
  MUSIC_HIGH_QUALITY_STEREO: 5, // 고품질 스테레오 음악
};

// 오디오 시나리오 설정
export const AUDIO_SCENARIO = {
  DEFAULT: 0, // 기본 시나리오
  CHATROOM_ENTERTAINMENT: 1, // 채팅방 엔터테인먼트
  EDUCATION: 2, // 교육
  GAME_STREAMING: 3, // 게임 스트리밍
  SHOWROOM: 4, // 쇼룸
  CHATROOM_GAMING: 5, // 게임 채팅방
}; 