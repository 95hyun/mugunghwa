import React from 'react';
import { Player } from '../../../types/game';

interface PlayerPreviewCardProps {
  player: Player;
  index: number;
  runningAnimation: 1 | 2;
}

const PlayerPreviewCard: React.FC<PlayerPreviewCardProps> = ({ 
  player, 
  index, 
  runningAnimation 
}) => {
  return (
    <div className="player-preview-card" key={player.id}>
      <div className="player-preview-number">{index + 1}</div>
      <img
        src={`/character/running_man_${runningAnimation}.png`}
        alt={`${player.name} 아바타`}
        className="player-preview-image"
      />
      <div 
        className="player-preview-name" 
        style={{ backgroundColor: player.color }}
      >
        {player.name}
      </div>
    </div>
  );
};

export default PlayerPreviewCard;
