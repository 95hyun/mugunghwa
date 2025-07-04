import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Player, GameState } from '../types/game';
import { GameHeader, CountdownOverlay, SyllableOverlay, ResultLoadingScreen, LiveRankings, CaughtAlert, SafeAlert, GameField, type FinishedPlayer } from '../components/game';
import './GamePage.css';
import './GameFloating.css';

const GamePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const initialPlayers = useMemo(() => 
    location.state?.players || [], 
    [location.state?.players]
  );
  
  const [gameState, setGameState] = useState<GameState>({
    players: [],
    currentRound: 0,
    gamePhase: 'playing',
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
  const [currentlyRunningPlayers, setCurrentlyRunningPlayers] = useState<Set<string>>(new Set()); // 현재 달리고 있는 플레이어들
  const [countdownValue, setCountdownValue] = useState<number | string | null>(null); // 카운트다운 상태 (3, 2, 1, "시작!", null)
  
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
    if (initialPlayers.length === 0) {
      navigate('/');
      return;
    }

    // 플레이어 초기화 - 홈페이지에서 받은 데이터 사용
    setGameState(prev => ({
      ...prev,
      players: initialPlayers,
      gamePhase: 'playing'
    }));
  }, [initialPlayers, navigate]);

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
        // 도착선 근처(80% = position 160) 플레이어는 달리기 확률 대폭 증가
        const progressPercentage = player.position / 200; // 0.0 ~ 1.0
        let moveChance = 0.25; // 기본 달리기 확률
        
        if (progressPercentage >= 0.8) {
          // 80% 이상 진행 시 xx% 확률로 대폭 증가
          moveChance = 0.75;
        } else if (progressPercentage >= 0.6) {
          // 60% 이상 진행 시 xx% 확률로 점진적 증가
          moveChance = 0.4;
        }
        
        const shouldMove = Math.random() < moveChance;
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
    
    
    setGameState(prev => {
      const newPlayers = prev.players.map(player => {
        if (caughtPlayerIds.has(player.id)) {
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
      
      const finalPlayers = [...state.players];
      let currentRank = 1;
      
      // 1. 골인한 플레이어들에게 순서대로 등수 할당
      currentFinishedOrder.forEach(playerId => {
        const playerIndex = finalPlayers.findIndex(p => p.id === playerId);
        if (playerIndex !== -1) {
          finalPlayers[playerIndex] = { ...finalPlayers[playerIndex], rank: currentRank };
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
          currentRank++;
        }
      });


      const finalState = {
        ...state,
        players: finalPlayers,
        gamePhase: 'finished' as const
      };

      // 결과 페이지로 이동 (history replace로 뒤로가기 방지)
      setTimeout(() => {
        navigate('/result', { 
          state: { 
            gameResult: finalState,
            players: finalState.players,
            playerNames: finalState.players.map((p: Player) => p.name) 
          },
          replace: true
        });
      }, 2000);

      return currentFinishedOrder; // 상태는 변경하지 않음
    });

    return {
      ...state,
      gamePhase: 'finished' as const
    };
  };

  const startGame = useCallback(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 게임 자동 시작 (HomePage에서 바로 게임 시작)
  useEffect(() => {
    if (gameState.gamePhase === 'playing' && gameState.players.length > 0) {
      startGame();
    }
  }, [gameState.gamePhase, gameState.players.length, startGame]);

  const activePlayers = gameState.players.filter(p => !p.isEliminated);
  const winners = activePlayers.filter(p => p.position >= 200);

  // 실시간 골인 순서 표시용 데이터
  const finishedPlayersForDisplay: FinishedPlayer[] = finishedOrder.map((playerId, index) => {
    const player = gameState.players.find(p => p.id === playerId);
    return player ? {
      id: playerId,
      name: player.name,
      rank: index + 1
    } : null;
  }).filter((player): player is FinishedPlayer => player !== null);

  return (
    <>
      <title>게임 진행 중 | 무궁화 꽃이 피었습니다</title>
      <meta name="description" content="무궁화 꽃이 피었습니다 게임이 진행 중입니다. 술래가 돌아보기 전에 골인하세요!" />
      
      <div className="game-page">
      <GameHeader 
        activePlayers={activePlayers.length}
        winners={winners.length}
      />

      {gameState.gamePhase === 'playing' && (
        <>
          <CountdownOverlay countdownValue={countdownValue} />

          <SyllableOverlay 
            isVisible={isShowingSyllables}
            currentIndex={currentSyllableIndex}
            syllables={syllables}
            speed={syllableSpeed}
            countdownValue={countdownValue}
          />

          <GameField
            players={gameState.players}
            isItLooking={gameState.isItLooking}
            playersMoving={playersMoving}
            currentlyRunningPlayers={currentlyRunningPlayers}
            countdownValue={countdownValue}
          />

          {/* 실시간 등수 표시 */}
          <LiveRankings finishedPlayers={finishedPlayersForDisplay} />

          {/* Alert 컴포넌트들 */}
          <CaughtAlert playersMovingCount={playersMoving.size} />
          <SafeAlert isItLooking={gameState.isItLooking} playersMovingCount={playersMoving.size} />
        </>
      )}

      {gameState.gamePhase === 'finished' && (
        <ResultLoadingScreen />
      )}
      </div>
    </>
  );
};

export default GamePage;