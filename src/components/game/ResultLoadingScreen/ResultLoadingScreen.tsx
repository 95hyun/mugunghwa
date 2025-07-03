import React from 'react';
import './ResultLoadingScreen.css';

const ResultLoadingScreen: React.FC = () => {
  return (
    <div className="floating-game-finished">
      <div className="game-finished-content">
        <h3>🎉 게임 종료!</h3>
        <p>결과 페이지로 이동합니다...</p>
        <div className="rainbow"></div>
      </div>
    </div>
  );
};

export default ResultLoadingScreen;
