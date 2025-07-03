import React from 'react';
import { Player as PlayerType } from '../../../types/game';
import RaceTrack from './RaceTrack';
import './GameField.css';

interface GameFieldProps {
  players: PlayerType[];
  isItLooking: boolean;
  playersMoving: Set<string>;
  currentlyRunningPlayers: Set<string>;
  runningAnimation: 1 | 2;
  countdownValue: number | string | null;
}

const GameField: React.FC<GameFieldProps> = ({
  players,
  isItLooking,
  playersMoving,
  currentlyRunningPlayers,
  runningAnimation,
  countdownValue
}) => {
  return (
    <div className="game-field">
      <RaceTrack
        players={players}
        isItLooking={isItLooking}
        playersMoving={playersMoving}
        currentlyRunningPlayers={currentlyRunningPlayers}
        runningAnimation={runningAnimation}
        countdownValue={countdownValue}
      />
    </div>
  );
};

export default GameField;
