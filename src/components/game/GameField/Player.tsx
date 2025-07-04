import React from 'react';
import { motion } from 'framer-motion';
import { Player as PlayerType } from '../../../types/game';

interface PlayerProps {
  player: PlayerType;
  isMoving: boolean;
  isRunning: boolean;
  countdownValue: number | string | null;
  isLeader: boolean;
}

const Player: React.FC<PlayerProps> = ({ 
  player, 
  isMoving, 
  isRunning, 
  countdownValue,
  isLeader
}) => {
  return (
    <motion.div
      className={`player ${player.isEliminated ? 'eliminated' : ''} ${player.position >= 200 ? 'winner' : ''} ${isMoving ? 'caught-moving' : ''}`}
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
          : isMoving
            ? 'none'
            : 'none'
      }}
      transition={{ duration: 0.5 }}
    >
      <img 
        src={
          player.position >= 200 
            ? '/character/winnerman.webp'
            : player.isEliminated 
              ? '/character/deadman.webp'
              : isRunning || isMoving 
                ? '/character/running_man_2.webp' 
                : '/character/running_man_1.webp'
        }
        alt={`${player.name} 아바타`}
        className="player-image"
      />
      <span 
        className="player-name"
        style={{ 
          backgroundColor: player.color, 
          color: '#fff', 
          boxShadow: `0 0 8px ${player.color}` 
        }}
      >
        #{player.id.split('-')[1]} {player.name}
      </span>
      {player.position >= 200 && (
        <span className="winner-crown">👑</span>
      )}
      {isLeader && player.position < 200 && (
        <span className="leader-crown">🥇</span>
      )}
      {isMoving && (
        <span className="caught-indicator">💥</span>
      )}
      {isMoving && (
        <span className="aim-indicator"></span>
      )}
    </motion.div>
  );
};

export default Player;
