import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { Player, GameState } from '../types/game';
import Button from '../components/common/Button';
import './GamePage.css';
import './GameFloating.css';

const GamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
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

  // 무궁화 꽃이 피었습니다 음절 상태
  const syllables = ['무', '궁', '화', '꽃', '이', '피', '었', '습', '니', '다'];
  const [currentSyllableIndex, setCurrentSyllableIndex] = useState(-1);
  const [isShowingSyllables, setIsShowingSyllables] = useState(false);
  const [playersMoving, setPlayersMoving] = useState<Set<string>>(new Set());
  const [syllableSpeed, setSyllableSpeed] = useState<'normal' | 'fast' | 'slow'>('normal');
  const [finishedOrder, setFinishedOrder] = useState<string[]>([]); // 골인 순서만 저장
  
  // Interval 및 Timeout 관리를 위한 ref
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const taggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextRoundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syllableTimeoutsRef = useRef<NodeJS.Timeout[]>([]);

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

  // 컴포넌트 언마운트 시 모든 timer 정리
  useEffect(() => {
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
        moveIntervalRef.current = null;
      }
      if (taggerTimeoutRef.current) {
        clearTimeout(taggerTimeoutRef.current);
        taggerTimeoutRef.current = null;
      }
      if (nextRoundTimeoutRef.current) {
        clearTimeout(nextRoundTimeoutRef.current);
        nextRoundTimeoutRef.current = null;
      }
      syllableTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      syllableTimeoutsRef.current = [];
    };
  }, []);

  const clearAllTimers = () => {
    // 모든 timer와 interval 정리
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    if (taggerTimeoutRef.current) {
      clearTimeout(taggerTimeoutRef.current);
      taggerTimeoutRef.current = null;
    }
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }
    syllableTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    syllableTimeoutsRef.current = [];
  };

  const startGame = () => {
    // 모든 기존 timer 정리
    clearAllTimers();
    
    setFinishedOrder([]); // 골인 순서 초기화
    setPlayersMoving(new Set()); // 움직이는 플레이어 초기화
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing'
    }));
    startRound();
  };

  const startRound = () => {
    setGameState(prev => ({ ...prev, isItLooking: false }));
    
    setTimeout(() => {
      startSyllableSequence();
    }, 500);
  };

  const startSyllableSequence = () => {
    // 기존 timers 정리
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    syllableTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    syllableTimeoutsRef.current = [];
    
    setIsShowingSyllables(true);
    setCurrentSyllableIndex(0);
    
    // 새로운 interval 시작
    moveIntervalRef.current = setInterval(() => {
      movePlayersRandomly();
    }, 300);
    
    const showNextSyllable = (index: number) => {
      if (index >= syllables.length) {
        // 모든 음절 완료 - interval 정리
        if (moveIntervalRef.current) {
          clearInterval(moveIntervalRef.current);
          moveIntervalRef.current = null;
        }
        
        setIsShowingSyllables(false);
        setCurrentSyllableIndex(-1);
        
        // 술래가 돌아보기
        const timeout = setTimeout(() => {
          taggerTurnsAround();
        }, 300);
        syllableTimeoutsRef.current.push(timeout);
        return;
      }

      setCurrentSyllableIndex(index);
      
      let nextDelay;
      let speedClass: 'normal' | 'fast' | 'slow' = 'normal';
      const randomPattern = Math.random();
      
      if (randomPattern < 0.25) {
        nextDelay = Math.random() * 130 + 50;
        speedClass = 'fast';
      } else if (randomPattern < 0.4) {
        nextDelay = Math.random() * 170 + 180;
        speedClass = 'fast';
      } else if (randomPattern < 0.6) {
        nextDelay = Math.random() * 250 + 350;
        speedClass = 'normal';
      } else if (randomPattern < 0.8) {
        nextDelay = Math.random() * 400 + 800;
        speedClass = 'slow';
      } else {
        nextDelay = Math.random() * 600 + 1200;
        speedClass = 'slow';
      }
      
      if (index > 0) {
        if (randomPattern < 0.1) {
          if (nextDelay > 600) {
            nextDelay = Math.random() * 120 + 50;
            speedClass = 'fast';
          } else if (nextDelay < 400) {
            nextDelay = Math.random() * 400 + 800;
            speedClass = 'slow';
          }
        }
      }
      
      setSyllableSpeed(speedClass);
      
      // 다음 음절로 진행
      const timeout = setTimeout(() => showNextSyllable(index + 1), nextDelay);
      syllableTimeoutsRef.current.push(timeout);
    };

    showNextSyllable(0);
  };

  const movePlayersRandomly = () => {
    setGameState(prev => {
      const newPlayers = prev.players.map(player => {
        if (player.isEliminated || player.position >= 200) return player;
        
        const shouldMove = Math.random() < 0.4;
        if (shouldMove) {
          const moveDistance = Math.random() * 3 + 2;
          const newPosition = Math.min(200, player.position + moveDistance);
          
          return {
            ...player,
            position: newPosition
          };
        }
        
        return player;
      });
      
      // 새로 골인한 플레이어들을 즉시 체크 (이전 위치와 비교)
      newPlayers.forEach(player => {
        const oldPlayer = prev.players.find(p => p.id === player.id);
        if (oldPlayer && oldPlayer.position < 200 && player.position >= 200) {
          // 새로 골인한 플레이어 - 즉시 finishedOrder 업데이트
          setFinishedOrder(currentOrder => {
            if (!currentOrder.includes(player.id)) {
              console.log(`${player.name}이 ${currentOrder.length + 1}등으로 골인!`);
              return [...currentOrder, player.id];
            }
            return currentOrder;
          });
        }
      });
      
      return {
        ...prev,
        players: newPlayers
      };
    });
  };

  const taggerTurnsAround = () => {
    // 기존 tagger timeout 정리
    if (taggerTimeoutRef.current) {
      clearTimeout(taggerTimeoutRef.current);
      taggerTimeoutRef.current = null;
    }
    
    setGameState(prev => {
      const stillMovingPlayers = new Set<string>();
      
      // 탈락하지 않고, 골인하지 않은 플레이어만 움직임 감지
      prev.players.forEach(player => {
        if (!player.isEliminated && player.position < 200 && Math.random() < 0.15) {
          stillMovingPlayers.add(player.id);
        }
      });
      
      setPlayersMoving(stillMovingPlayers);
      
      // 1.5초 후 탈락자 처리 - 현재 playersMoving 상태를 사용
      taggerTimeoutRef.current = setTimeout(() => {
        // 실시간으로 현재 움직이고 있는 플레이어들을 확인
        setPlayersMoving(currentMovingPlayers => {
          eliminateCaughtPlayers(currentMovingPlayers);
          return new Set(); // 처리 후 초기화
        });
      }, 1500);
      
      return { ...prev, isItLooking: true };
    });
  };

  const eliminateCaughtPlayers = (caughtPlayerIds: Set<string>) => {
    // 기존 next round timeout 정리
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }
    
    console.log('탈락 처리 - 걸린 플레이어:', Array.from(caughtPlayerIds)); // 디버깅용
    
    setGameState(prev => {
      const newPlayers = prev.players.map(player => {
        if (caughtPlayerIds.has(player.id)) {
          console.log(`${player.name} 탈락 처리됨`); // 디버깅용
          return {
            ...player,
            isEliminated: true,
            eliminatedRound: prev.currentRound + 1
          };
        }
        return player;
      });

      const activePlayers = newPlayers.filter(p => !p.isEliminated);
      const nonFinishedActivePlayers = activePlayers.filter(p => p.position < 200);

      // 게임 종료 조건 체크
      if (nonFinishedActivePlayers.length === 0 || activePlayers.length <= 1) {
        // 게임 종료 - 모든 timer 정리
        clearAllTimers();
        return finishGame({ ...prev, players: newPlayers });
      }

      return {
        ...prev,
        players: newPlayers,
        isItLooking: false,
        currentRound: prev.currentRound + 1 // 라운드 증가
      };
    });

    // 다음 라운드 시작 (게임이 종료되지 않은 경우에만)
    nextRoundTimeoutRef.current = setTimeout(() => {
      setGameState(currentState => {
        // 게임이 이미 종료되었다면 다음 라운드를 시작하지 않음
        if (currentState.gamePhase === 'finished') {
          return currentState;
        }
        
        const currentActivePlayers = currentState.players.filter(p => !p.isEliminated);
        const currentNonFinished = currentActivePlayers.filter(p => p.position < 200);
        
        if (currentNonFinished.length > 0 && currentActivePlayers.length > 1) {
          startRound();
        }
        
        return currentState;
      });
    }, 1000);
  };

  const finishGame = (state: GameState) => {
    // 모든 timer 정리
    clearAllTimers();
    
    // 최신 골인 순서를 가져와서 등수 계산
    setFinishedOrder(currentFinishedOrder => {
      console.log('게임 종료 - 골인 순서:', currentFinishedOrder);
      
      const finalPlayers = [...state.players];
      let currentRank = 1;
      
      // 1. 골인한 플레이어들에게 순서대로 등수 할당
      currentFinishedOrder.forEach(playerId => {
        const playerIndex = finalPlayers.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          finalPlayers[playerIndex] = { ...finalPlayers[playerIndex], rank: currentRank };
          console.log(`${finalPlayers[playerIndex].name}에게 ${currentRank}등 할당`);
          currentRank++;
        }
      });
      
      // 2. 골인하지 못한 활성 플레이어들을 거리순으로 등수 할당
      const nonFinishedActive = state.players.filter(p => 
        !p.isEliminated && 
        p.position < 200 && 
        !currentFinishedOrder.includes(p.id)
      );
      const sortedNonFinished = nonFinishedActive.sort((a, b) => b.position - a.position);
      
      sortedNonFinished.forEach(player => {
        const playerIndex = finalPlayers.findIndex(p => p.id === player.id);
        if (playerIndex !== -1) {
          finalPlayers[playerIndex] = { ...finalPlayers[playerIndex], rank: currentRank };
          console.log(`${player.name}에게 ${currentRank}등 할당`);
          currentRank++;
        }
      });
      
      // 3. 탈락한 플레이어들을 거리순으로 등수 할당
      const eliminatedPlayers = state.players.filter(p => p.isEliminated);
      const sortedEliminated = eliminatedPlayers.sort((a, b) => b.position - a.position);
      
      sortedEliminated.forEach(player => {
        const playerIndex = finalPlayers.findIndex(p => p.id === player.id);
        if (playerIndex !== -1) {
          finalPlayers[playerIndex] = { ...finalPlayers[playerIndex], rank: currentRank };
          console.log(`${player.name}에게 ${currentRank}등 할당`);
          currentRank++;
        }
      });

      console.log('최종 플레이어들:', finalPlayers);

      const finalState = {
        ...state,
        players: finalPlayers,
        gamePhase: 'finished' as const
      };

      // 결과 페이지로 이동
      setTimeout(() => {
        navigate('/result', { 
          state: { 
            gameResult: finalState,
            playerNames: playerNames 
          } 
        });
      }, 2000);

      return currentFinishedOrder; // 상태는 변경하지 않음
    });

    return {
      ...state,
      gamePhase: 'finished' as const
    };
  };

  const activePlayers = gameState.players.filter(p => !p.isEliminated);
  const winners = activePlayers.filter(p => p.position >= 200);

  // 실시간 골인 순서 표시용 데이터
  const finishedPlayersForDisplay = finishedOrder.map((playerId, index) => {
    const player = gameState.players.find(p => p.id === playerId);
    return player ? {
      id: playerId,
      name: player.name,
      rank: index + 1
    } : null;
  }).filter(Boolean);

  return (
    <div className="game-page">
      <div className="game-header">
        <h2>무궁화 꽃이 피었습니다</h2>
        <div className="game-info">
          <span>참가자: {activePlayers.length}명</span>
          {winners.length > 0 && (
            <span className="winner-indicator">🏆 골인: {winners.length}명</span>
          )}
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
          <p className="game-rules">
            🎯 <strong>게임 규칙:</strong><br/>
            • 술래가 뒤돌고 "무궁화 꽃이 피었습니다"를 외치는 동안 이동 가능<br/>
            • 술래가 돌아볼 때 움직이면 탈락!<br/>
            • 먼저 골인하거나 마지막까지 살아남으면 승리!
          </p>
          <Button onClick={startGame} variant="primary" size="large">
            게임 시작!
          </Button>
        </motion.div>
      )}

      {gameState.gamePhase === 'playing' && (
        <>
          <AnimatePresence>
            {isShowingSyllables && currentSyllableIndex >= 0 && (
              <motion.div 
                className="syllable-overlay"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <h1 className={`syllable-text ${syllableSpeed}`}>
                  {syllables.slice(0, currentSyllableIndex + 1).join('')}
                </h1>
                <div className="syllable-progress">
                  {syllables.map((syllable, index) => (
                    <span 
                      key={index}
                      className={`syllable-dot ${index <= currentSyllableIndex ? 'active' : ''}`}
                    >
                      {syllable}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="game-field">
            <div className="race-track">
              {gameState.players.map(player => (
                <motion.div
                  key={player.id}
                  className={`player ${player.isEliminated ? 'eliminated' : ''} ${player.position >= 200 ? 'winner' : ''} ${playersMoving.has(player.id) ? 'caught-moving' : ''}`}
                  style={{ 
                    backgroundColor: player.color,
                    bottom: `${5 + Math.min(player.position/2, 90)}%`
                  }}
                  animate={{
                    x: player.isEliminated ? [0, 10, -10, 0] : 0,
                    opacity: player.isEliminated ? 0.3 : 1,
                    scale: player.position >= 200 ? 1.2 : (player.isEliminated ? 0.8 : 1),
                    boxShadow: player.position >= 200 ? '0 0 20px gold' : playersMoving.has(player.id) ? '0 0 15px red' : 'none'
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="player-name">{player.name}</span>
                  {player.position >= 200 && (
                    <span className="winner-crown">👑</span>
                  )}
                  {playersMoving.has(player.id) && (
                    <span className="caught-indicator">💥</span>
                  )}
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

          {/* 실시간 등수 표시 */}
          {finishedPlayersForDisplay.length > 0 && (
            <motion.div 
              className="live-rankings floating-rankings"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3>🏆 골인 순서</h3>
              <div className="ranking-list">
                {finishedPlayersForDisplay.map((player, index) => (
                  <motion.div
                    key={player!.id}
                    className="ranking-item"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.2 }}
                  >
                    <span className="rank-number">#{player!.rank}등</span>
                    <span className="ranking-player-name">{player!.name}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {gameState.isItLooking && playersMoving.size > 0 && (
            <motion.div 
              className="caught-alert floating-alert"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <h3>🚨 걸렸다! {playersMoving.size}명이 움직이고 있습니다!</h3>
            </motion.div>
          )}

          {gameState.isItLooking && playersMoving.size === 0 && (
            <motion.div 
              className="safe-alert floating-alert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <h3>✅ 모두 안전합니다!</h3>
            </motion.div>
          )}
        </>
      )}

      {gameState.gamePhase === 'finished' && (
        <motion.div 
          className="floating-game-finished"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="game-finished-content"
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          >
            <h3>🎉 게임 종료!</h3>
            <div className="rainbow"></div>
            <p>결과 페이지로 이동합니다...</p>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default GamePage;