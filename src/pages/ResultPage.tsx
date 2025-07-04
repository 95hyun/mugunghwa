import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { GameState, Player } from '../types/game';
import Button from '../components/common/Button';
import './ResultPage.css';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const gameResult: GameState = location.state?.gameResult;
  const players: Player[] = location.state?.players || [];
  
  const [showScrollHint, setShowScrollHint] = useState(false);
  const resultsListRef = useRef<HTMLDivElement>(null);
  const [showCopied, setShowCopied] = useState(false);

  // 정렬된 플레이어 목록 (gameResult가 없을 때 빈 배열)
  const sortedPlayers = gameResult ? [...gameResult.players].sort((a, b) => {
    const rankA = a.rank || 999;
    const rankB = b.rank || 999;
    return rankA - rankB;
  }) : [];

  // 스크롤 가능 여부 체크 - Hook을 조건부 없이 항상 호출
  useEffect(() => {
    // gameResult가 없으면 early return
    if (!gameResult || sortedPlayers.length === 0) {
      return;
    }

    const checkScrollable = () => {
      if (resultsListRef.current) {
        const { scrollHeight, clientHeight, scrollTop } = resultsListRef.current;
        const isScrollable = scrollHeight > clientHeight;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
        setShowScrollHint(isScrollable && !isAtBottom);
      }
    };

    const handleScroll = () => {
      checkScrollable();
    };

    const resultsElement = resultsListRef.current;
    if (resultsElement) {
      resultsElement.addEventListener('scroll', handleScroll);
      // 초기 체크
      const timeoutId = setTimeout(checkScrollable, 100);
      // 윈도우 리사이즈 시에도 체크
      window.addEventListener('resize', checkScrollable);

      return () => {
        resultsElement.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', checkScrollable);
        clearTimeout(timeoutId);
      };
    }
  }, [gameResult, sortedPlayers.length]);

  // gameResult가 없으면 홈으로 리다이렉트
  useEffect(() => {
    if (!gameResult) {
      navigate('/');
    }
  }, [gameResult, navigate]);

  // gameResult가 없으면 null 반환 (리다이렉트 중)
  if (!gameResult) {
    return null;
  }
  
  const getRankEmoji = (rank: number | null) => {
    if (!rank || rank === 0) return '❓';
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏃‍♂️';
    }
  };

  const getRankText = (rank: number | null) => {
    if (!rank || rank === 0) return '순위 없음';
    switch (rank) {
      case 1: return '1등';
      case 2: return '2등';
      case 3: return '3등';
      default: return `${rank}등`;
    }
  };

  const getProgressPercentage = (position: number) => {
    return Math.min(Math.round(position / 2), 100);
  };

  const newGame = () => {
    navigate('/');
  };

  const restartGame = () => {
    // 플레이어 데이터를 초기 상태로 리셋
    const resetPlayers = players.map((player: Player) => ({
      ...player,
      position: 0,
      isEliminated: false,
      eliminatedRound: null,
      rank: null
    }));
    
    navigate('/game', { state: { players: resetPlayers } });
  };

  const scrollToBottom = () => {
    if (resultsListRef.current) {
      resultsListRef.current.scrollTo({
        top: resultsListRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  // 결과 텍스트 생성 함수
  const getResultShareText = () => {
    if (!gameResult) return '';
    const sorted = [...gameResult.players].sort((a, b) => (a.rank || 999) - (b.rank || 999));
    const rankText = sorted.map((p, i) => `#${p.rank} ${p.name}`).join(', ');
    return `[무궁화 꽃이 피었습니다 결과]\n${rankText}`;
  };

  // 클립보드 복사 및 플로팅 문구 표시
  const handleShareResult = async () => {
    const text = getResultShareText();
    try {
      await navigator.clipboard.writeText(text);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 1800);
    } catch (e) {
      alert('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <div className="result-page">
      <motion.div 
        className="result-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="result-title"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        >
          게임 결과
        </motion.h1>

        <div className="results-wrapper">
          <div className={`results-list ${showScrollHint ? 'hide-scrollbar' : ''}`} ref={resultsListRef}>
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.id}
                className={`result-item ${player.rank === 1 ? 'winner' : ''}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.4 }}
              >
                <div className="rank-section">
                  <span className="rank-emoji">{getRankEmoji(player.rank)}</span>
                  <span className="rank-text">{getRankText(player.rank)}</span>
                </div>
                
                <div className="progress-section">
                  <div className="progress-bar-container">
                    <motion.div 
                      className="progress-bar"
                      style={{ backgroundColor: player.color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${getProgressPercentage(player.position)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 + 0.6 }}
                    >
                      <span className="progress-bar-text">{player.name}</span>
                    </motion.div>
                  </div>
                  <div className="progress-info">
                    <span className="progress-percentage">
                      {player.position >= 200 ? '🏁 골인!' : `${getProgressPercentage(player.position)}m`}
                      {player.isEliminated && ' (탈락)'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          {/* 스크롤 힌트 화살표 - results-wrapper 내부, results-list 외부로 이동하여 고정 위치 */}
          {showScrollHint && (
            <motion.div 
              className="scroll-hint"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onClick={scrollToBottom}
            >
              <div className="scroll-hint-text">더 보기</div>
              <div className="scroll-arrow">
                <span>▼</span>
              </div>
            </motion.div>
          )}
        </div>

        <motion.div 
          className="result-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button
            onClick={newGame}
            variant="secondary"
            size="large"
          >
            새로하기
          </Button>
          
          <Button
            onClick={restartGame}
            variant="primary"
            size="large"
          >
            재시작
          </Button>
          <Button
            onClick={handleShareResult}
            variant="primary"
            size="large"
          >
            결과 공유
          </Button>
        </motion.div>
        {showCopied && (
          <div className="floating-copy-toast">게임 결과가 클립보드에 복사되었습니다!</div>
        )}
      </motion.div>
    </div>
  );
};

export default ResultPage;
