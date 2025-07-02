import { Player, GameState, GameSettings } from '../types/game';
import { getRandomElements, getRandomBoolean, getRandomFloat, generateId } from './randomUtils';

export class GameEngine {
  private settings: GameSettings;

  constructor(settings?: Partial<GameSettings>) {
    this.settings = {
      maxPlayers: 10,
      moveChance: 0.3,        // 30% 확률로 움직임
      eliminationRate: 0.2,   // 20% 탈락률
      roundDuration: 3000,    // 3초 라운드
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
   * 랜덤하게 플레이어를 탈락시킵니다
   */
  eliminateRandomPlayers(players: Player[], currentRound: number): Player[] {
    const activePlayers = players.filter(p => !p.isEliminated);
    
    // 마지막 1명 또는 0명이면 탈락시키지 않음
    if (activePlayers.length <= 1) {
      return players;
    }

    // 탈락시킬 플레이어 수 계산 (최소 1명, 최대 절반)
    const maxEliminations = Math.floor(activePlayers.length / 2);
    const minEliminations = 1;
    const eliminationCount = Math.min(
      maxEliminations,
      Math.max(
        minEliminations,
        Math.floor(activePlayers.length * this.settings.eliminationRate)
      )
    );

    // 마지막 1명은 남겨두기
    const actualEliminationCount = Math.min(
      eliminationCount,
      activePlayers.length - 1
    );

    // 랜덤하게 탈락자 선정
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
   * 게임이 끝났는지 확인합니다
   */
  isGameFinished(players: Player[]): boolean {
    const activePlayers = players.filter(p => !p.isEliminated);
    return activePlayers.length <= 1;
  }

  /**
   * 최종 등수를 계산합니다
   */
  calculateFinalRanks(players: Player[]): Player[] {
    const result = [...players];
    
    // 승자 (탈락하지 않은 플레이어)
    const winner = result.find(p => !p.isEliminated);
    if (winner) {
      const winnerIndex = result.findIndex(p => p.id === winner.id);
      result[winnerIndex] = { ...winner, rank: 1 };
    }

    // 탈락한 플레이어들을 탈락 라운드 순으로 정렬하여 등수 매기기
    const eliminatedPlayers = result
      .filter(p => p.isEliminated)
      .sort((a, b) => (b.eliminatedRound || 0) - (a.eliminatedRound || 0));

    eliminatedPlayers.forEach((player, index) => {
      const playerIndex = result.findIndex(p => p.id === player.id);
      result[playerIndex] = { ...player, rank: index + 2 };
    });

    return result;
  }

  /**
   * 게임 상태를 업데이트합니다
   */
  updateGameState(
    currentState: GameState,
    action: 'START' | 'MOVE' | 'ELIMINATE' | 'NEXT_ROUND' | 'FINISH'
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

      case 'NEXT_ROUND':
        if (this.isGameFinished(currentState.players)) {
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
}

// 기본 게임 엔진 인스턴스
export const defaultGameEngine = new GameEngine();
