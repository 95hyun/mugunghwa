import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../../../types/game';
import Button from '../../common/Button';
import PlayerPreviewCard from './PlayerPreviewCard';
import './PreparationScreen.css';

interface PreparationScreenProps {
  players: Player[];
  onStartGame: () => void;
  runningAnimation: 1 | 2;
}

const PreparationScreen: React.FC<PreparationScreenProps> = ({
  players,
  onStartGame,
  runningAnimation
}) => {
  return (
    <motion.div 
      className="preparation-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3>게임 준비</h3>
      <p>참가자 {players.length}명이 준비되었습니다.</p>
      
      <div className="player-preview-list">
        {players.map((player, idx) => (
          <PlayerPreviewCard
            key={player.id}
            player={player}
            index={idx}
            runningAnimation={runningAnimation}
          />
        ))}
      </div>
      
      <p className="game-rules">
        🎯 <strong>게임 규칙:</strong><br/>
        • 술래가 뒤돌고 "무궁화 꽃이 피었습니다"를 외치는 동안 이동 가능<br/>
        • 술래가 돌아볼 때 움직이면 탈락!<br/>
        • 먼저 골인하거나 마지막까지 살아남으면 승리!
      </p>
      
      <Button onClick={onStartGame} variant="primary" size="large">
        게임 시작
      </Button>
    </motion.div>
  );
};

export default PreparationScreen;
