import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Player, GameState } from '../types/game';
import Button from '../components/common/Button';
import './GamePage.css';

const GamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // ESLint 경고 해결: playerNames를 useMemo로 메모이제이션
  const playerNames = useMemo(() => 
    location.state?.playerNames || [], 
    [location.state?.playerNames]
  );
  
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentRound: 0,
    gamePhase: 'preparation',
    isItLooking: false,
    gameSpeed: 3,
    totalRounds: 0
  });

  const [showText, setShowText] = useState(false);

  useEffect(() => {
    if (playerNames.length === 0) {
      navigate('/');
      return;
    }

    // 플레이어 초기화
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd', '#98d8c8', '#ff7675', '#74b9ff', '#fd79a8'];
    const initialPlayers: Player[] = playerNames.map((name: string, index: number) => ({
      id: `player-${index}`,
      name,
      position: 0,
      isEliminated: false,
      eliminatedRound: null,
      rank: null,
      color: colors[index % colors.length]
    }));

    setGameState(prev => ({
      ...prev,
      players: initialPlayers,
      gamePhase: 'preparation'
    }));
  }, [playerNames, navigate]);

  const startGame = () => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing',
      currentRound: 1
    }));
    startRound();
  };

  const startRound = () => {
    setShowText(true);
    
    // "무궁화 꽃이 피었습니다" 텍스트를 2초간 보여줌
    setTimeout(() => {
      setShowText(false);
      movePlayersRandomly();
    }, 2000);
  };

  const movePlayersRandomly = () => {
    setGameState(prev => {
      const newPlayers = prev.players.map(player => {
        if (player.isEliminated) return player;
        
        // 30% 확률로 10-30만큼 전진
        const shouldMove = Math.random() < 0.3;
        const moveDistance = shouldMove ? Math.random() * 20 + 10 : 0;
        
        return {
          ...player,
          position: Math.min(100, player.position + moveDistance)
        };
      });
      
      return {
        ...prev,
        players: newPlayers
      };
    });

    // 1.5초 후 술래가 돌아봄
    setTimeout(() => {
      lookBack();
    }, 1500);
  };

  const lookBack = () => {
    setGameState(prev => ({ ...prev, isItLooking: true }));
    
    // 0.5초 후 탈락자 선정
    setTimeout(() => {
      eliminateRandomPlayers();
    }, 500);
  };

  const eliminateRandomPlayers = () => {
    setGameState(prev => {
      const activePlayers = prev.players.filter(p => !p.isEliminated);
      
      if (activePlayers.length <= 1) {
        return finishGame(prev);
      }

      // 1-2명 랜덤 탈락
      const eliminateCount = Math.min(
        Math.floor(Math.random() * 2) + 1,
        activePlayers.length - 1
      );
      
      // TypeScript 타입 에러 해결: Player[] 타입 명시
      const playersToEliminate: Player[] = [];
      for (let i = 0; i < eliminateCount; i++) {
        const randomIndex = Math.floor(Math.random() * activePlayers.length);
        if (!playersToEliminate.includes(activePlayers[randomIndex])) {
          playersToEliminate.push(activePlayers[randomIndex]);
        }
      }

      const newPlayers = prev.players.map(player => {
        if (playersToEliminate.some(p => p.id === player.id)) {
          return {
            ...player,
            isEliminated: true,
            eliminatedRound: prev.currentRound
          };
        }
        return player;
      });

      const remainingPlayers = newPlayers.filter(p => !p.isEliminated);
      
      if (remainingPlayers.length <= 1) {
        return finishGame({ ...prev, players: newPlayers });
      }

      return {
        ...prev,
        players: newPlayers,
        isItLooking: false
      };
    });

    // 1초 후 다음 라운드
    setTimeout(() => {
      nextRound();
    }, 1000);
  };

  const nextRound = () => {
    setGameState(prev => {
      const remainingPlayers = prev.players.filter(p => !p.isEliminated);
      
      if (remainingPlayers.length <= 1) {
        return finishGame(prev);
      }

      return {
        ...prev,
        currentRound: prev.currentRound + 1,
        isItLooking: false
      };
    });

    startRound();
  };

  const finishGame = (state: GameState) => {
    const finalPlayers = state.players.map((player) => {
      if (!player.isEliminated) {
        return { ...player, rank: 1 };
      }
      return player;
    });

    // 탈락 순서대로 등수 매기기
    const eliminatedPlayers = finalPlayers
      .filter(p => p.isEliminated)
      .sort((a, b) => (b.eliminatedRound || 0) - (a.eliminatedRound || 0));

    eliminatedPlayers.forEach((player, index) => {
      const playerIndex = finalPlayers.findIndex(p => p.id === player.id);
      finalPlayers[playerIndex].rank = index + 2;
    });

    const finalState = {
      ...state,
      players: finalPlayers,
      gamePhase: 'finished' as const
    };

    // 결과 페이지로 이동
    setTimeout(() => {
      navigate('/result', { state: { gameResult: finalState } });
    }, 2000);

    return finalState;
  };

  const activePlayers = gameState.players.filter(p => !p.isEliminated);

  return (
    <div className="game-page">
      <div className="game-header">
        <h2>무궁화 꽃이 피었습니다</h2>
        <div className="game-info">
          <span>라운드: {gameState.currentRound}</span>
          <span>남은 참가자: {activePlayers.length}명</span>
        </div>
      </div>

      {gameState.gamePhase === 'preparation' && (
        <motion.div 
          className="preparation-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3>게임 준비</h3>
          <p>참가자 {gameState.players.length}명이 준비되었습니다.</p>
          <Button onClick={startGame} variant="primary" size="large">
            게임 시작!
          </Button>
        </motion.div>
      )}

      {gameState.gamePhase === 'playing' && (
        <>
          {showText && (
            <motion.div 
              className="game-text-overlay"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <h1 className="game-text">무궁화 꽃이 피었습니다</h1>
            </motion.div>
          )}

          <div className="game-field">
            <div className="race-track">
              {gameState.players.map(player => (
                <motion.div
                  key={player.id}
                  className={`player ${player.isEliminated ? 'eliminated' : ''}`}
                  style={{ 
                    backgroundColor: player.color,
                    left: `${player.position}%`
                  }}
                  animate={{
                    x: player.isEliminated ? [0, 10, -10, 0] : 0,
                    opacity: player.isEliminated ? 0.3 : 1,
                    scale: player.isEliminated ? 0.8 : 1
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="player-name">{player.name}</span>
                </motion.div>
              ))}
            </div>
            
            <div className="finish-line">🏁</div>
            
            <motion.div 
              className="tagger"
              animate={{
                rotateY: gameState.isItLooking ? 0 : 180
              }}
              transition={{ duration: 0.5 }}
            >
              👮‍♂️
            </motion.div>
          </div>
        </>
      )}

      {gameState.gamePhase === 'finished' && (
        <motion.div 
          className="game-finished"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <h3>게임 종료!</h3>
          <p>결과 페이지로 이동합니다...</p>
        </motion.div>
      )}
    </div>
  );
};

export default GamePage;
