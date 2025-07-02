import React from 'react';
import { motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { GameState } from '../types/game';
import Button from '../components/common/Button';
import './ResultPage.css';

const ResultPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const gameResult: GameState = location.state?.gameResult;
  const playerNames: string[] = location.state?.playerNames || [];

  if (!gameResult) {
    navigate('/');
    return null;
  }

  const sortedPlayers = [...gameResult.players].sort((a, b) => {
    const rankA = a.rank || 999; // null이나 undefined인 경우 큰 값으로 처리
    const rankB = b.rank || 999;
    return rankA - rankB;
  });
  
  const getRankEmoji = (rank: number | null) => {
    if (!rank || rank === 0) return '❓'; // 순위 없음 표시
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏃‍♂️';
    }
  };

  const getRankText = (rank: number | null) => {
    if (!rank || rank === 0) return '순위 없음'; // 0등 문제 해결
    switch (rank) {
      case 1: return '1등';
      case 2: return '2등';
      case 3: return '3등';
      default: return `${rank}등`;
    }
  };

  const newGame = () => {
    navigate('/');
  };

  const restartGame = () => {
    navigate('/game', { state: { playerNames: playerNames } });
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
          🎉 게임 결과 🎉
        </motion.h1>

        <div className="results-list">
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
              
              <div 
                className="player-info"
                style={{ backgroundColor: player.color }}
              >
                <span className="player-name">{player.name}</span>
              </div>
              
              <div className="player-distance">
                {player.position >= 200 ? '🏁 골인!' : `${Math.round(player.position/2)}%`}
                {player.isEliminated && ' (탈락)'}
              </div>
            </motion.div>
          ))}
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
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResultPage;
