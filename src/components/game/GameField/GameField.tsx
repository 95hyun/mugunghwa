import React from 'react';
import { Player as PlayerType } from '../../../types/game';
import RaceTrack from './RaceTrack';
import './GameField.css';

interface GameFieldProps {
  players: PlayerType[];
  isItLooking: boolean;
  playersMoving: Set<string>;
  currentlyRunningPlayers: Set<string>;
  countdownValue: number | string | null;
}

const GameField: React.FC<GameFieldProps> = ({
  players,
  isItLooking,
  playersMoving,
  currentlyRunningPlayers,
  countdownValue
}) => {
  return (
    <div className="game-field">
      <RaceTrack
        players={players}
        isItLooking={isItLooking}
        playersMoving={playersMoving}
        currentlyRunningPlayers={currentlyRunningPlayers}
        countdownValue={countdownValue}
      />
    </div>
  );
};

export default GameField;
