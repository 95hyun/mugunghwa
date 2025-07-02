export interface Player {
  id: string;
  name: string;
  position: number;        // 현재 위치 (0-100)
  isEliminated: boolean;   // 탈락 여부
  eliminatedRound: number | null; // 탈락 라운드
  rank: number | null;     // 최종 등수
  color: string;          // 플레이어 색상
}

export interface GameState {
  players: Player[];
  currentRound: number;
  gamePhase: 'preparation' | 'playing' | 'paused' | 'finished';
  isItLooking: boolean;    // 술래가 뒤돌아보는 중인지
  gameSpeed: number;       // 게임 속도 설정 (1-5)
  totalRounds: number;     // 총 라운드 수
}

export interface GameSettings {
  maxPlayers: number;
  moveChance: number;      // 플레이어가 움직일 확률 (0-1)
  eliminationRate: number; // 탈락률 (0-1)
  roundDuration: number;   // 라운드 지속 시간 (ms)
}

export type GamePhase = 'preparation' | 'playing' | 'paused' | 'finished';
