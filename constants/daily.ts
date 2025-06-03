// Daily.co API 설정
export const DAILY_API_KEY = 'YOUR_DAILY_API_KEY'; // Daily.co API 키를 여기에 입력해야 합니다
export const DAILY_API_URL = 'https://api.daily.co/v1';

// 방 설정
export const ROOM_SETTINGS = {
  max_participants: 10,
  enable_chat: false,
  enable_recording: false,
  enable_screenshare: false,
  enable_video: false,
  enable_audio: true,
  exp: Math.round(Date.now() / 1000) + (60 * 60 * 24), // 24시간 후 만료
};

// API 엔드포인트
export const ENDPOINTS = {
  CREATE_ROOM: `${DAILY_API_URL}/rooms`,
  GET_ROOM: (roomName: string) => `${DAILY_API_URL}/rooms/${roomName}`,
  DELETE_ROOM: (roomName: string) => `${DAILY_API_URL}/rooms/${roomName}`,
  GET_ROOM_TOKEN: (roomName: string) => `${DAILY_API_URL}/meeting-tokens/${roomName}`,
}; 