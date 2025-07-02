import { useState, useCallback, useRef, useEffect } from 'react';
import { GameState, Player, GameStats, GameMode, GameEvent } from '../types/game';
import { GameEngine } from '../utils/gameEngine';

interface UseGameLogicReturn {
  gameState: GameState;
  gameStats: GameStats | null;
  gameEvents: GameEvent[];
  isPlaying: boolean;
  isPaused: boolean;
  startGame: (playerNames: string[], gameMode?: GameMode) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  isLoading: boolean;
  error: string | null;
  gameEngine: GameEngine;
  simulateGame: (playerNames: string[]) => GameState;
}

export const useGameLogic = (gameMode: GameMode = 'normal'): UseGameLogicReturn => {
  const gameEngineRef = useRef(new GameEngine());
  const gameStartTimeRef = useRef<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameEvents, setGameEvents] = useState<GameEvent[]>([]);
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentRound: 0,
    gamePhase: 'preparation',
    isItLooking: false,
    gameSpeed: 3,
    totalRounds: 0
  });

  const isPlaying = gameState.gamePhase === 'playing';
  const isPaused = gameState.gamePhase === 'paused';

  // 게임 이벤트 추가 함수
  const addGameEvent = useCallback((event: Omit<GameEvent, 'timestamp'>) => {
    const newEvent: GameEvent = {
      ...event,
      timestamp: Date.now()
    };
    setGameEvents(prev => [...prev, newEvent]);
  }, []);

  // 게임 통계 업데이트
  const updateGameStats = useCallback((currentState: GameState) => {
    if (!gameStartTimeRef.current) return;

    const gameEngine = gameEngineRef.current;
    const stats = gameEngine.calculateGameStats(currentState);
    const gameTime = Date.now() - gameStartTimeRef.current;

    setGameStats({
      ...stats,
      gameTime,
      roundHistory: [] // 필요시 라운드 히스토리 구현
    });
  }, []);

  // 게임 상태 변경 시 통계 업데이트
  useEffect(() => {
    if (gameState.gamePhase === 'playing' || gameState.gamePhase === 'finished') {
      updateGameStats(gameState);
    }
  }, [gameState, updateGameStats]);

  const startGame = useCallback((playerNames: string[], selectedGameMode: GameMode = gameMode) => {
    try {
      setIsLoading(true);
      setError(null);
      setGameEvents([]);
      setGameStats(null);

      if (playerNames.length < 2) {
        throw new Error('최소 2명의 참가자가 필요합니다.');
      }

      if (playerNames.length > 10) {
        throw new Error('최대 10명까지만 참가할 수 있습니다.');
      }

      // 중복 이름 체크
      const uniqueNames = new Set(playerNames.map(name => name.trim()));
      if (uniqueNames.size !== playerNames.length) {
        throw new Error('중복된 이름이 있습니다.');
      }

      // 빈 이름 체크
      if (playerNames.some(name => !name.trim())) {
        throw new Error('빈 이름은 허용되지 않습니다.');
      }

      // 게임 모드에 따른 게임 엔진 설정
      const gameEngine = gameEngineRef.current;
      switch (selectedGameMode) {
        case 'fast':
          gameEngine.updateSettings({
            roundDuration: 4000,
            moveChance: 0.4,
            eliminationRate: 0.5
          });
          break;
        case 'slow':
          gameEngine.updateSettings({
            roundDuration: 8000,
            moveChance: 0.2,
            eliminationRate: 0.3
          });
          break;
        case 'intense':
          gameEngine.updateSettings({
            roundDuration: 5000,
            moveChance: 0.3,
            eliminationRate: 0.6
          });
          break;
        default: // normal
          gameEngine.updateSettings({
            roundDuration: 6000,
            moveChance: 0.3,
            eliminationRate: 0.4
          });
      }

      const initialPlayers = gameEngine.initializePlayers(playerNames);
      gameStartTimeRef.current = Date.now();

      setGameState({
        players: initialPlayers,
        currentRound: 0,
        gamePhase: 'preparation',
        isItLooking: false,
        gameSpeed: 3,
        totalRounds: 0
      });

      // 게임 시작 이벤트
      addGameEvent({
        type: 'round_start',
        roundNumber: 0,
        data: { gameMode: selectedGameMode, playerCount: playerNames.length }
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '게임 시작 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, [gameMode, addGameEvent]);

  const pauseGame = useCallback(() => {
    if (gameState.gamePhase === 'playing') {
      setGameState(prev => ({
        ...prev,
        gamePhase: 'paused'
      }));
      
      addGameEvent({
        type: 'round_end',
        roundNumber: gameState.currentRound,
        data: { action: 'paused' }
      });
    }
  }, [gameState.gamePhase, gameState.currentRound, addGameEvent]);

  const resumeGame = useCallback(() => {
    if (gameState.gamePhase === 'paused') {
      setGameState(prev => ({
        ...prev,
        gamePhase: 'playing'
      }));
      
      addGameEvent({
        type: 'round_start',
        roundNumber: gameState.currentRound,
        data: { action: 'resumed' }
      });
    }
  }, [gameState.gamePhase, gameState.currentRound, addGameEvent]);

  const resetGame = useCallback(() => {
    setGameState({
      players: [],
      currentRound: 0,
      gamePhase: 'preparation',
      isItLooking: false,
      gameSpeed: 3,
      totalRounds: 0
    });
    setError(null);
    setGameEvents([]);
    setGameStats(null);
    gameStartTimeRef.current = null;
    
    addGameEvent({
      type: 'game_end',
      roundNumber: 0,
      data: { action: 'reset' }
    });
  }, [addGameEvent]);

  const simulateGame = useCallback((playerNames: string[]): GameState => {
    const gameEngine = gameEngineRef.current;
    return gameEngine.simulateGame(playerNames);
  }, []);

  return {
    gameState,
    gameStats,
    gameEvents,
    isPlaying,
    isPaused,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    isLoading,
    error,
    gameEngine: gameEngineRef.current,
    simulateGame
  };
};

// 게임 검증 유틸리티 훅
export const useGameValidation = () => {
  const validatePlayerNames = useCallback((names: string[]): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (names.length < 2) {
      errors.push('최소 2명의 참가자가 필요합니다.');
    }

    if (names.length > 10) {
      errors.push('최대 10명까지만 참가할 수 있습니다.');
    }

    const trimmedNames = names.map(name => name.trim());
    const emptyNames = trimmedNames.filter(name => !name);
    if (emptyNames.length > 0) {
      errors.push('빈 이름은 허용되지 않습니다.');
    }

    const uniqueNames = new Set(trimmedNames);
    if (uniqueNames.size !== trimmedNames.length) {
      errors.push('중복된 이름이 있습니다.');
    }

    const longNames = trimmedNames.filter(name => name.length > 10);
    if (longNames.length > 0) {
      errors.push('이름은 10자 이내로 입력해주세요.');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    validatePlayerNames
  };
};

// 게임 통계 분석 훅
export const useGameAnalytics = () => {
  const analyzeGameResult = useCallback((gameState: GameState) => {
    const totalPlayers = gameState.players.length;
    const eliminatedPlayers = gameState.players.filter(p => p.isEliminated);
    const winners = gameState.players.filter(p => !p.isEliminated && p.position >= 100);
    const survivors = gameState.players.filter(p => !p.isEliminated && p.position < 100);

    const averagePosition = gameState.players.reduce((sum, p) => sum + p.position, 0) / totalPlayers;
    const maxPosition = Math.max(...gameState.players.map(p => p.position));
    
    const roundsPerElimination = gameState.totalRounds / Math.max(eliminatedPlayers.length, 1);
    const eliminationRate = eliminatedPlayers.length / totalPlayers;

    return {
      totalPlayers,
      eliminatedCount: eliminatedPlayers.length,
      winnerCount: winners.length,
      survivorCount: survivors.length,
      averagePosition: Math.round(averagePosition * 100) / 100,
      maxPosition: Math.round(maxPosition * 100) / 100,
      roundsPerElimination: Math.round(roundsPerElimination * 100) / 100,
      eliminationRate: Math.round(eliminationRate * 100) / 100,
      gameEfficiency: gameState.totalRounds <= 10 ? 'High' : gameState.totalRounds <= 20 ? 'Medium' : 'Low',
      competitiveness: eliminationRate > 0.7 ? 'High' : eliminationRate > 0.4 ? 'Medium' : 'Low'
    };
  }, []);

  const compareGameModes = useCallback((results: { mode: GameMode; result: GameState }[]) => {
    return results.map(({ mode, result }) => ({
      mode,
      analysis: analyzeGameResult(result),
      players: result.players.length,
      rounds: result.totalRounds,
      winners: result.players.filter(p => !p.isEliminated && p.position >= 100).length
    }));
  }, [analyzeGameResult]);

  return {
    analyzeGameResult,
    compareGameModes
  };
};
