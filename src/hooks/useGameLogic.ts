import { useState, useCallback, useRef } from 'react';
import { GameState, Player } from '../types/game';
import { GameEngine } from '../utils/gameEngine';

interface UseGameLogicReturn {
  gameState: GameState;
  isPlaying: boolean;
  startGame: (playerNames: string[]) => void;
  pauseGame: () => void;
  resumeGame: () => void;
  resetGame: () => void;
  isLoading: boolean;
  error: string | null;
}

export const useGameLogic = (): UseGameLogicReturn => {
  const gameEngineRef = useRef(new GameEngine());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentRound: 0,
    gamePhase: 'preparation',
    isItLooking: false,
    gameSpeed: 3,
    totalRounds: 0
  });

  const isPlaying = gameState.gamePhase === 'playing';

  const startGame = useCallback((playerNames: string[]) => {
    try {
      setIsLoading(true);
      setError(null);

      if (playerNames.length < 2) {
        throw new Error('최소 2명의 참가자가 필요합니다.');
      }

      if (playerNames.length > 10) {
        throw new Error('최대 10명까지만 참가할 수 있습니다.');
      }

      // 중복 이름 체크
      const uniqueNames = new Set(playerNames);
      if (uniqueNames.size !== playerNames.length) {
        throw new Error('중복된 이름이 있습니다.');
      }

      const gameEngine = gameEngineRef.current;
      const initialPlayers = gameEngine.initializePlayers(playerNames);

      setGameState({
        players: initialPlayers,
        currentRound: 0,
        gamePhase: 'preparation',
        isItLooking: false,
        gameSpeed: 3,
        totalRounds: 0
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : '게임 시작 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'paused'
    }));
  }, []);

  const resumeGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing'
    }));
  }, []);

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
  }, []);

  return {
    gameState,
    isPlaying,
    startGame,
    pauseGame,
    resumeGame,
    resetGame,
    isLoading,
    error
  };
};
