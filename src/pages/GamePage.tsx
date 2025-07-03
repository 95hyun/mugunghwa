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
  const [runningAnimation, setRunningAnimation] = useState<1 | 2>(1); // 달리기 애니메이션 상태
  const [currentlyRunningPlayers, setCurrentlyRunningPlayers] = useState<Set<string>>(new Set()); // 현재 달리고 있는 플레이어들
  const [countdownValue, setCountdownValue] = useState<number | string | null>(null); // 카운트다운 상태 (3, 2, 1, "시작!", null)
  
  // 달리기 애니메이션을 위한 주기적 리렌더링 - 음절이 외쳐지는 동안에만
  useEffect(() => {
    let animationInterval: NodeJS.Timeout;
    
    if (isShowingSyllables || currentlyRunningPlayers.size > 0) {
      animationInterval = setInterval(() => {
        // 강제 리렌더링을 위한 더미 상태 업데이트
        setRunningAnimation(prev => prev === 1 ? 2 : 1);
      }, 200);
    }
    
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [isShowingSyllables, currentlyRunningPlayers.size]);
  
  // 준비화면 달리기 애니메이션 (게임 준비 상태일 때만)
  useEffect(() => {
    let preparationAnimationInterval: NodeJS.Timeout;
    
    if (gameState.gamePhase === 'preparation') {
      preparationAnimationInterval = setInterval(() => {
        setRunningAnimation(prev => prev === 1 ? 2 : 1);
      }, 500); // 0.5초마다 애니메이션 프레임 변경
    }
    
    return () => {
      if (preparationAnimationInterval) {
        clearInterval(preparationAnimationInterval);
      }
    };
  }, [gameState.gamePhase]);
  
  // Interval 및 Timeout 관리를 위한 ref
  const moveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const taggerTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const nextRoundTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const syllableTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const runningAnimationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 카운트다운 타이머

  // 모든 타이머와 인터벌을 정리하는 함수
  const clearAllTimers = () => {
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
    if (runningAnimationIntervalRef.current) {
      clearInterval(runningAnimationIntervalRef.current);
      runningAnimationIntervalRef.current = null;
    }
    if (countdownTimeoutRef.current) {
      clearTimeout(countdownTimeoutRef.current);
      countdownTimeoutRef.current = null;
    }
    syllableTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
    syllableTimeoutsRef.current = [];
  };

  useEffect(() => {
    if (playerNames.length === 0) {
      navigate('/');
      return;
    }

    // 플레이어 초기화
    const colors = ['#444', '#666', '#888', '#555', '#777', '#999', '#333', '#aaa', '#bbb', '#ccc'];
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
      if (runningAnimationIntervalRef.current) {
        clearInterval(runningAnimationIntervalRef.current);
        runningAnimationIntervalRef.current = null;
      }
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
        countdownTimeoutRef.current = null;
      }
      syllableTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      syllableTimeoutsRef.current = [];
    };
  }, []);

  // 달리기 애니메이션 디버깅
  useEffect(() => {
    console.log('Running animation state:', runningAnimation);
    console.log('Players moving (caught):', Array.from(playersMoving));
    console.log('Currently running players:', Array.from(currentlyRunningPlayers));
    console.log('Is showing syllables:', isShowingSyllables);
  }, [runningAnimation, playersMoving, currentlyRunningPlayers, isShowingSyllables]);

  const startGame = () => {
    // 모든 기존 timer 정리
    clearAllTimers();
    
    setFinishedOrder([]); // 골인 순서 초기화
    setPlayersMoving(new Set()); // 움직이는 플레이어 초기화
    setCurrentlyRunningPlayers(new Set()); // 달리기 플레이어 초기화
    setCountdownValue(null); // 카운트다운 초기화
    setGameState(prev => ({
      ...prev,
      gamePhase: 'playing'
    }));
    
    // 카운트다운 시작
    startCountdown();
  };

  const startCountdown = () => {
    setCountdownValue(3); // 3부터 시작
    
    const countdownSequence = (value: number | string) => {
      if (typeof value === 'number' && value > 0) {
        setCountdownValue(value);
        countdownTimeoutRef.current = setTimeout(() => {
          countdownSequence(value - 1);
        }, 1000); // 1초 간격
      } else if (value === 0) {
        setCountdownValue("시작!"); // "시작!" 표시
        countdownTimeoutRef.current = setTimeout(() => {
          setCountdownValue(null); // 카운트다운 완전 종료
          // 카운트다운 완료 후 실제 게임 시작
          setTimeout(() => {
            startRound();
          }, 300); // 0.3초 대기 후 게임 시작
        }, 1000); // "시작!"을 1초간 표시
      }
    };
    
    countdownSequence(3);
  };

  const startRound = () => {
    // 카운트다운 중이면 실행하지 않음
    if (countdownValue !== null) return;
    
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
    setCurrentlyRunningPlayers(new Set()); // 달리기 상태 초기화
    
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
        // 달리기 애니메이션을 잠시 더 유지하다가 정리
        setTimeout(() => {
          setCurrentlyRunningPlayers(new Set());
        }, 200);
        
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
    const movedPlayers = new Set<string>();
    setGameState(prev => {
      const newPlayers = prev.players.map(player => {
        if (player.isEliminated || player.position >= 200) return player;
        const shouldMove = Math.random() < 0.4;
        if (shouldMove) {
          const moveDistance = Math.random() * 3 + 2;
          const newPosition = Math.min(200, player.position + moveDistance);
          movedPlayers.add(player.id);
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
    
    // 움직인 플레이어들을 달리기 애니메이션에 추가 (Set spread를 Array.from으로 대체)
    setCurrentlyRunningPlayers(prev => {
      const updated = new Set(prev);
      movedPlayers.forEach(playerId => updated.add(playerId));
      return updated;
    });
    
    console.log('이번에 움직인 플레이어:', Array.from(movedPlayers));
    console.log('현재 달리고 있는 플레이어:', Array.from(movedPlayers));
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
      
      // 음절이 끝났으므로 달리기 애니메이션도 정리
      setCurrentlyRunningPlayers(new Set());
      
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
          // 다음 라운드에서는 카운트다운 없이 바로 시작
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

  // 결과 이동 중 로딩 화면 컴포넌트
  const ResultLoadingScreen: React.FC = () => (
    <div className="floating-game-finished">
      <div className="game-finished-content">
        <h3>🎉 게임 종료!</h3>
        <p>결과 페이지로 이동합니다...</p>
        <div className="rainbow"></div>
      </div>
    </div>
  );

  return (
    <div className="game-page">
      <div className="game-header">
        <h2>무궁화 꽃이 피었습니다</h2>
        <div className="game-info">
          <span>생존자: {activePlayers.length}명</span>
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
          <div className="player-preview-list">
            {gameState.players.map((player, idx) => (
              <div className="player-preview-card" key={player.id}>
                <div className="player-preview-number">{idx + 1}</div>
                <img
                  src={`/character/running_man_${runningAnimation}.png`}
                  alt={`${player.name} 아바타`}
                  className="player-preview-image"
                />
                <div className="player-preview-name" style={{ backgroundColor: player.color }}>{player.name}</div>
              </div>
            ))}
          </div>
          <p className="game-rules">
            🎯 <strong>게임 규칙:</strong><br/>
            • 술래가 뒤돌고 "무궁화 꽃이 피었습니다"를 외치는 동안 이동 가능<br/>
            • 술래가 돌아볼 때 움직이면 탈락!<br/>
            • 먼저 골인하거나 마지막까지 살아남으면 승리!
          </p>
          <Button onClick={startGame} variant="primary" size="large">
            게임 시작
          </Button>
        </motion.div>
      )}

      {gameState.gamePhase === 'playing' && (
        <>
          <AnimatePresence>
            {countdownValue !== null && (
              <motion.div 
                className="countdown-overlay"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className={`countdown-display ${countdownValue === "시작!" ? "countdown-start" : "countdown-number"}`}
                  key={countdownValue} // key를 추가하여 각 값마다 새로운 애니메이션
                  initial={{ scale: 0.5, rotate: countdownValue === "시작!" ? -20 : -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: countdownValue === "시작!" ? 1.2 : 1.5, rotate: countdownValue === "시작!" ? 20 : 10, opacity: 0 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: countdownValue === "시작!" ? 400 : 300, 
                    damping: countdownValue === "시작!" ? 20 : 15 
                  }}
                >
                  {countdownValue}
                </motion.div>
                <motion.p 
                  className="countdown-text"
                  key={`text-${countdownValue}`} // 텍스트도 각 값마다 애니메이션
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {countdownValue === "시작!" ? "무궁화 꽃이 피었습니다!" : "게임 시작 준비"}
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {isShowingSyllables && currentSyllableIndex >= 0 && countdownValue === null && (
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
                    bottom: `${5 + Math.min(player.position/2, 90)}%`,
                    opacity: countdownValue !== null ? 0.3 : 1 // 카운트다운 중에는 흐리게 표시
                  }}
                  animate={{
                    x: player.isEliminated ? [0, 10, -10, 0] : 0,
                    opacity: countdownValue !== null ? 0.3 : (player.isEliminated ? 0.3 : 1),
                    scale: player.position >= 200 ? 1.2 : (player.isEliminated ? 0.8 : 1),
                    boxShadow: player.position >= 200
                      ? '0 0 20px gold'
                      : playersMoving.has(player.id)
                        ? 'none'
                        : 'none'
                  }}
                  transition={{ duration: 0.5 }}
                >
                  <img 
                    src={
                      // 음절이 외쳐지는 동안 움직인 플레이어들 또는 술래가 돌아볼 때 걸린 플레이어들
                      (isShowingSyllables && currentlyRunningPlayers.has(player.id)) || 
                      playersMoving.has(player.id)
                        ? `/character/running_man_${runningAnimation}.png`
                        : '/character/running_man_1.png'
                    }
                    alt={`${player.name} 아바타`}
                    className="player-image"
                  />
                  <span 
                    className="player-name"
                    style={{ backgroundColor: player.color, color: '#fff', boxShadow: `0 0 8px ${player.color}` }}
                  >
                    {player.name}
                  </span>
                  {player.position >= 200 && (
                    <span className="winner-crown">👑</span>
                  )}
                  {playersMoving.has(player.id) && (
                    <span className="caught-indicator">💥</span>
                  )}
                  {playersMoving.has(player.id) && (
                    <span className="aim-indicator"></span>
                  )}
                </motion.div>
              ))}
            </div>
            
            <div className="finish-line"></div>
            <div className="start-line"></div>
            
            <div className="tagger">
              <AnimatePresence mode="wait">
                <motion.img 
                  key={gameState.isItLooking ? "front" : "back"}
                  src={gameState.isItLooking ? "/character/gaksital_front.png" : "/character/gaksital_back.png"}
                  alt={gameState.isItLooking ? "술래 정면" : "술래 뒤돌아보기"}
                  className="tagger-image"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                />
              </AnimatePresence>
            </div>
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
        <ResultLoadingScreen />
      )}
    </div>
  );
};

export default GamePage;