import { Player, GameState, GameSettings } from '../types/game';
import { getRandomElements, getRandomBoolean, getRandomFloat, generateId } from './randomUtils';

export class GameEngine {
  private settings: GameSettings;

  constructor(settings?: Partial<GameSettings>) {
    this.settings = {
      maxPlayers: 10,
      moveChance: 0.3,        // X% 확률로 움직임
      eliminationRate: 0.1,   // x% 탈락률 (더 많은 플레이어가 탈락 가능)
      roundDuration: 4000,    // x초 라운드 (3초 텍스트 + 2초 이동 + 1초 돌아보기)
      ...settings
    };
  }

  /**
   * 플레이어 초기화
   */
  initializePlayers(names: string[]): Player[] {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', 
      '#dda0dd', '#98d8c8', '#ff7675', '#74b9ff', '#fd79a8'
    ];

    return names.map((name, index) => ({
      id: generateId(),
      name: name.trim(),
      position: 0,
      isEliminated: false,
      eliminatedRound: null,
      rank: null,
      color: colors[index % colors.length]
    }));
  }

  /**
   * 플레이어들을 랜덤하게 이동시킵니다
   */
  movePlayersRandomly(players: Player[]): Player[] {
    return players.map(player => {
      if (player.isEliminated) return player;

      // 설정된 확률에 따라 움직임 결정
      const shouldMove = getRandomBoolean(this.settings.moveChance);
      
      if (shouldMove) {
        // 10~30 사이의 랜덤한 거리만큼 전진
        const moveDistance = getRandomFloat(10, 30);
        const newPosition = Math.min(100, player.position + moveDistance);
        
        return {
          ...player,
          position: newPosition
        };
      }

      return player;
    });
  }

  /**
   * 랜덤하게 플레이어를 탈락시킵니다 (개선된 버전)
   */
  eliminateRandomPlayers(players: Player[], currentRound: number): Player[] {
    const activePlayers = players.filter(p => !p.isEliminated);
    
    // 골인한 플레이어가 있는지 확인
    const winnersThisRound = activePlayers.filter(p => p.position >= 100);
    if (winnersThisRound.length > 0) {
      // 골인한 플레이어는 탈락하지 않음
      return players;
    }

    // 마지막 1명 또는 0명이면 탈락시키지 않음
    if (activePlayers.length <= 1) {
      return players;
    }

    // 탈락시킬 플레이어 수 계산 (개선된 로직)
    // 최소 1명, 최대 전체 활성 플레이어의 80%까지 탈락 가능
    const maxEliminations = Math.max(1, Math.floor(activePlayers.length * 0.8));
    const minEliminations = 1;
    
    // 라운드가 진행될수록 더 많은 플레이어가 탈락할 수 있도록 조정
    const roundMultiplier = Math.min(1.5, 1 + (currentRound - 1) * 0.1);
    const baseEliminationCount = Math.floor(activePlayers.length * this.settings.eliminationRate * roundMultiplier);
    
    const eliminationCount = Math.min(
      maxEliminations,
      Math.max(
        minEliminations,
        baseEliminationCount
      )
    );

    // 마지막 1명은 반드시 남겨두기
    const actualEliminationCount = Math.min(
      eliminationCount,
      activePlayers.length - 1
    );

    // 랜덤하게 탈락자 선정 (완전 랜덤)
    const playersToEliminate = getRandomElements(activePlayers, actualEliminationCount);

    return players.map(player => {
      const shouldEliminate = playersToEliminate.some(p => p.id === player.id);
      
      if (shouldEliminate) {
        return {
          ...player,
          isEliminated: true,
          eliminatedRound: currentRound
        };
      }

      return player;
    });
  }

  /**
   * 골인한 플레이어가 있는지 확인합니다
   */
  checkForWinners(players: Player[]): Player[] {
    return players.filter(p => !p.isEliminated && p.position >= 100);
  }

  /**
   * 게임이 끝났는지 확인합니다 (개선된 버전)
   */
  isGameFinished(players: Player[]): boolean {
    const activePlayers = players.filter(p => !p.isEliminated);
    const winners = this.checkForWinners(players);
    
    // 승자가 있거나 활성 플레이어가 1명 이하면 게임 종료
    return winners.length > 0 || activePlayers.length <= 1;
  }

  /**
   * 게임 계속 진행 가능 여부 확인
   */
  canContinueGame(players: Player[]): boolean {
    const activePlayers = players.filter(p => !p.isEliminated);
    const winners = this.checkForWinners(players);
    
    // 승자가 없고 활성 플레이어가 2명 이상이면 계속 진행
    return winners.length === 0 && activePlayers.length > 1;
  }

  /**
   * 최종 등수를 계산합니다 (개선된 버전)
   */
  calculateFinalRanks(players: Player[]): Player[] {
    const result = [...players];
    const winners = this.checkForWinners(players);
    
    // 골인한 플레이어들은 모두 1등 (동시 골인 가능)
    winners.forEach(winner => {
      const winnerIndex = result.findIndex(p => p.id === winner.id);
      if (winnerIndex !== -1) {
        result[winnerIndex] = { ...winner, rank: 1 };
      }
    });

    // 살아남은 플레이어들 (골인하지 않았지만 탈락하지 않은 플레이어들)
    const survivors = result.filter(p => !p.isEliminated && p.position < 100);
    survivors.forEach(survivor => {
      const survivorIndex = result.findIndex(p => p.id === survivor.id);
      if (survivorIndex !== -1) {
        result[survivorIndex] = { ...survivor, rank: winners.length + 1 };
      }
    });

    // 탈락한 플레이어들을 탈락 라운드 순으로 정렬하여 등수 매기기
    const eliminatedPlayers = result
      .filter(p => p.isEliminated)
      .sort((a, b) => (b.eliminatedRound || 0) - (a.eliminatedRound || 0));

    let currentRank = winners.length + survivors.length + 1;
    eliminatedPlayers.forEach((player) => {
      const playerIndex = result.findIndex(p => p.id === player.id);
      if (playerIndex !== -1) {
        result[playerIndex] = { ...player, rank: currentRank++ };
      }
    });

    return result;
  }

  /**
   * 게임 통계 계산
   */
  calculateGameStats(gameState: GameState): {
    totalPlayers: number;
    totalRounds: number;
    eliminationRate: number;
    averageProgress: number;
    winners: Player[];
  } {
    const totalPlayers = gameState.players.length;
    const eliminatedPlayers = gameState.players.filter(p => p.isEliminated);
    const winners = this.checkForWinners(gameState.players);
    
    const averageProgress = gameState.players.reduce((sum, player) => sum + player.position, 0) / totalPlayers;
    const eliminationRate = eliminatedPlayers.length / totalPlayers;

    return {
      totalPlayers,
      totalRounds: gameState.totalRounds,
      eliminationRate,
      averageProgress,
      winners
    };
  }

  /**
   * 게임 상태를 업데이트합니다 (개선된 버전)
   */
  updateGameState(
    currentState: GameState,
    action: 'START' | 'MOVE' | 'ELIMINATE' | 'NEXT_ROUND' | 'FINISH' | 'CHECK_WINNER'
  ): GameState {
    switch (action) {
      case 'START':
        return {
          ...currentState,
          gamePhase: 'playing',
          currentRound: 1,
          isItLooking: false
        };

      case 'MOVE':
        const movedPlayers = this.movePlayersRandomly(currentState.players);
        return {
          ...currentState,
          players: movedPlayers
        };

      case 'ELIMINATE':
        const eliminatedPlayers = this.eliminateRandomPlayers(
          currentState.players,
          currentState.currentRound
        );
        
        return {
          ...currentState,
          players: eliminatedPlayers,
          isItLooking: true
        };

      case 'CHECK_WINNER':
        if (this.isGameFinished(currentState.players)) {
          return this.updateGameState(currentState, 'FINISH');
        }
        return currentState;

      case 'NEXT_ROUND':
        if (this.isGameFinished(currentState.players)) {
          return this.updateGameState(currentState, 'FINISH');
        }

        if (!this.canContinueGame(currentState.players)) {
          return this.updateGameState(currentState, 'FINISH');
        }

        return {
          ...currentState,
          currentRound: currentState.currentRound + 1,
          isItLooking: false
        };

      case 'FINISH':
        const finalPlayers = this.calculateFinalRanks(currentState.players);
        return {
          ...currentState,
          players: finalPlayers,
          gamePhase: 'finished',
          totalRounds: currentState.currentRound
        };

      default:
        return currentState;
    }
  }

  /**
   * 게임 설정을 업데이트합니다
   */
  updateSettings(newSettings: Partial<GameSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
  }

  /**
   * 현재 게임 설정을 반환합니다
   */
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  /**
   * 게임 시뮬레이션 (테스트용)
   */
  simulateGame(playerNames: string[]): GameState {
    let gameState: GameState = {
      players: this.initializePlayers(playerNames),
      currentRound: 0,
      gamePhase: 'preparation',
      isItLooking: false,
      gameSpeed: 3,
      totalRounds: 0
    };

    gameState = this.updateGameState(gameState, 'START');

    while (gameState.gamePhase === 'playing' && gameState.currentRound < 50) { // 무한 루프 방지
      gameState = this.updateGameState(gameState, 'MOVE');
      gameState = this.updateGameState(gameState, 'ELIMINATE');
      
      if (this.isGameFinished(gameState.players)) {
        gameState = this.updateGameState(gameState, 'FINISH');
        break;
      }
      
      gameState = this.updateGameState(gameState, 'NEXT_ROUND');
    }

    return gameState;
  }
}

// 기본 게임 엔진 인스턴스
export const defaultGameEngine = new GameEngine();

// 게임 엔진 팩토리 함수들
export const createFastGame = () => new GameEngine({
  roundDuration: 4000,
  moveChance: 0.4,
  eliminationRate: 0.5
});

export const createSlowGame = () => new GameEngine({
  roundDuration: 8000,
  moveChance: 0.2,
  eliminationRate: 0.3
});

export const createIntenseGame = () => new GameEngine({
  roundDuration: 5000,
  moveChance: 0.3,
  eliminationRate: 0.6
});
