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

  if (!gameResult) {
    navigate('/');
    return null;
  }

  const sortedPlayers = [...gameResult.players].sort((a, b) => (a.rank || 0) - (b.rank || 0));
  
  const getRankEmoji = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '🏃‍♂️';
    }
  };

  const getRankText = (rank: number) => {
    switch (rank) {
      case 1: return '1등 - 승리!';
      case 2: return '2등 - 준우승!';
      case 3: return '3등 - 3위!';
      default: return `${rank}등`;
    }
  };

  const playAgain = () => {
    navigate('/');
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

        <motion.div 
          className="result-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          총 {gameResult.currentRound}라운드로 진행되었습니다
        </motion.div>

        <div className="results-list">
          {sortedPlayers.map((player, index) => (
            <motion.div
              key={player.id}
              className={`result-item ${player.rank === 1 ? 'winner' : ''}`}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.6 }}
            >
              <div className="rank-section">
                <span className="rank-emoji">{getRankEmoji(player.rank || 0)}</span>
                <span className="rank-text">{getRankText(player.rank || 0)}</span>
              </div>
              
              <div 
                className="player-info"
                style={{ backgroundColor: player.color }}
              >
                <span className="player-name">{player.name}</span>
                {player.eliminatedRound && (
                  <span className="elimination-info">
                    {player.eliminatedRound}라운드 탈락
                  </span>
                )}
              </div>
              
              <div className="final-position">
                최종 위치: {Math.round(player.position)}%
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="result-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <Button
            onClick={playAgain}
            variant="primary"
            size="large"
          >
            다시 게임하기
          </Button>
        </motion.div>

        <motion.div 
          className="game-stats"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <h3>게임 통계</h3>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">총 참가자</span>
              <span className="stat-value">{gameResult.players.length}명</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">총 라운드</span>
              <span className="stat-value">{gameResult.currentRound}라운드</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">승자</span>
              <span className="stat-value">{sortedPlayers[0]?.name}</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResultPage;
