import React from 'react';
import './GameHeader.css';

interface GameHeaderProps {
  activePlayers: number;
  winners: number;
}

const GameHeader: React.FC<GameHeaderProps> = ({ activePlayers, winners }) => {
  return (
    <div className="game-header">
      <h2>무궁화 꽃이 피었습니다</h2>
      <div className="game-info">
        <span>생존자: {activePlayers}명</span>
        {winners > 0 && (
          <span className="winner-indicator">🏆 골인: {winners}명</span>
        )}
      </div>
    </div>
  );
};

export default GameHeader;
