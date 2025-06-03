import { DAILY_API_KEY, DAILY_API_URL, ROOM_SETTINGS, ENDPOINTS } from '@/constants/daily';

interface CreateRoomResponse {
  id: string;
  name: string;
  api_created: boolean;
  privacy: string;
  url: string;
  created_at: string;
  config: typeof ROOM_SETTINGS;
}

interface RoomTokenResponse {
  token: string;
}

export const dailyService = {
  // 방 생성
  async createRoom(roomName: string): Promise<CreateRoomResponse> {
    const response = await fetch(ENDPOINTS.CREATE_ROOM, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        ...ROOM_SETTINGS,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create room');
    }

    return response.json();
  },

  // 방 정보 가져오기
  async getRoom(roomName: string): Promise<CreateRoomResponse> {
    const response = await fetch(ENDPOINTS.GET_ROOM(roomName), {
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get room');
    }

    return response.json();
  },

  // 방 삭제
  async deleteRoom(roomName: string): Promise<void> {
    const response = await fetch(ENDPOINTS.DELETE_ROOM(roomName), {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to delete room');
    }
  },

  // 참가자 토큰 생성
  async getRoomToken(roomName: string, userName: string): Promise<string> {
    const response = await fetch(ENDPOINTS.GET_ROOM_TOKEN(roomName), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        properties: {
          user_name: userName,
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to get room token');
    }

    const data: RoomTokenResponse = await response.json();
    return data.token;
  },
}; 