export interface Player {
  id: string;
  name: string;
  position: number;        // 현재 위치 (0-200) - 200%까지 확장
  isEliminated: boolean;   // 탈락 여부
  eliminatedRound: number | null; // 탈락 라운드
  rank: number | null;     // 최종 등수
  color: string;          // 플레이어 색상
}

export interface GameState {
  players: Player[];
  currentRound: number;    // 내부적으로만 사용 (탈락 순서 계산용)
  gamePhase: 'preparation' | 'playing' | 'paused' | 'finished';
  isItLooking: boolean;    // 술래가 뒤돌아보는 중인지
  gameSpeed: number;       // 게임 속도 설정 (1-5)
  totalRounds: number;     // 내부적으로만 사용
}

export interface GameSettings {
  maxPlayers: number;
  moveChance: number;      // 플레이어가 움직일 확률 (0-1)
  eliminationRate: number; // 탈락률 (0-1)
  roundDuration: number;   // 라운드 지속 시간 (ms)
}

export interface GameStats {
  totalPlayers: number;
  totalRounds: number;
  eliminationRate: number;
  averageProgress: number;
  winners: Player[];
  gameTime: number;        // 게임 진행 시간 (ms)
  roundHistory: RoundResult[];
}

export interface RoundResult {
  roundNumber: number;
  playersMove: Player[];   // 이동한 플레이어들
  playersEliminated: Player[]; // 탈락한 플레이어들
  playersRemaining: number; // 남은 플레이어 수
  winners: Player[];       // 골인한 플레이어들
}

export interface GameConfig {
  gameMode: 'normal' | 'fast' | 'slow' | 'intense';
  enableSound: boolean;
  showDetailedStats: boolean;
  autoRestart: boolean;
}

export type GamePhase = 'preparation' | 'playing' | 'paused' | 'finished';

export type GameMode = 'normal' | 'fast' | 'slow' | 'intense';

export type GameAction = 
  | 'START'
  | 'MOVE' 
  | 'ELIMINATE' 
  | 'NEXT_ROUND' 
  | 'FINISH' 
  | 'PAUSE'
  | 'RESUME'
  | 'CHECK_WINNER';

// 게임 이벤트 타입
export interface GameEvent {
  type: 'player_move' | 'player_eliminated' | 'player_winner' | 'round_start' | 'round_end' | 'game_end';
  playerId?: string;
  roundNumber: number;
  timestamp: number;
  data?: any;
}

// 애니메이션 관련 타입
export interface AnimationConfig {
  textDuration: number;    // "무궁화 꽃이 피었습니다" 표시 시간
  moveDuration: number;    // 플레이어 이동 시간
  lookDuration: number;    // 술래 돌아보기 시간
  eliminationDuration: number; // 탈락 애니메이션 시간
  pauseBetweenRounds: number; // 라운드 간 대기 시간
}

// 플레이어 상태 타입
export type PlayerStatus = 'active' | 'eliminated' | 'winner';

// 게임 결과 타입
export interface GameResult {
  finalState: GameState;
  stats: GameStats;
  duration: number;
  winners: Player[];
  eliminated: Player[];
}

// 유효성 검사 결과 타입
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// 게임 설정 프리셋
export const GAME_PRESETS: Record<GameMode, GameSettings> = {
  normal: {
    maxPlayers: 10,
    moveChance: 0.3,
    eliminationRate: 0.4,
    roundDuration: 6000
  },
  fast: {
    maxPlayers: 10,
    moveChance: 0.4,
    eliminationRate: 0.5,
    roundDuration: 4000
  },
  slow: {
    maxPlayers: 10,
    moveChance: 0.2,
    eliminationRate: 0.3,
    roundDuration: 8000
  },
  intense: {
    maxPlayers: 10,
    moveChance: 0.3,
    eliminationRate: 0.6,
    roundDuration: 5000
  }
};

// 애니메이션 프리셋
export const ANIMATION_PRESETS: Record<GameMode, AnimationConfig> = {
  normal: {
    textDuration: 3000,
    moveDuration: 2000,
    lookDuration: 1000,
    eliminationDuration: 1500,
    pauseBetweenRounds: 1000
  },
  fast: {
    textDuration: 2000,
    moveDuration: 1500,
    lookDuration: 800,
    eliminationDuration: 1000,
    pauseBetweenRounds: 800
  },
  slow: {
    textDuration: 4000,
    moveDuration: 3000,
    lookDuration: 1500,
    eliminationDuration: 2000,
    pauseBetweenRounds: 1500
  },
  intense: {
    textDuration: 2500,
    moveDuration: 1800,
    lookDuration: 1200,
    eliminationDuration: 1200,
    pauseBetweenRounds: 800
  }
};

// 상수 정의
export const GAME_CONSTANTS = {
  MAX_PLAYERS: 10,
  MIN_PLAYERS: 2,
  WINNING_POSITION: 200, // 골인 위치를 200%로 변경
  DEFAULT_GAME_SPEED: 3,
  MAX_ROUNDS: 50, // 무한 루프 방지
  PLAYER_COLORS: [
    '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', 
    '#dda0dd', '#98d8c8', '#ff7675', '#74b9ff', '#fd79a8'
  ]
} as const;
