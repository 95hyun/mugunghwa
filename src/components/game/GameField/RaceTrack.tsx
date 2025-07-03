import React from 'react';
import { Player as PlayerType } from '../../../types/game';
import Player from './Player';
import Tagger from './Tagger';
import FinishLine from './FinishLine';
import StartLine from './StartLine';

interface RaceTrackProps {
  players: PlayerType[];
  isItLooking: boolean;
  playersMoving: Set<string>;
  currentlyRunningPlayers: Set<string>;
  runningAnimation: 1 | 2;
  countdownValue: number | string | null;
}

const RaceTrack: React.FC<RaceTrackProps> = ({
  players,
  isItLooking,
  playersMoving,
  currentlyRunningPlayers,
  runningAnimation,
  countdownValue
}) => {
  return (
    <div className="race-track">
      {players.map(player => (
        <Player
          key={player.id}
          player={player}
          isMoving={playersMoving.has(player.id)}
          isRunning={currentlyRunningPlayers.has(player.id)}
          runningAnimation={runningAnimation}
          countdownValue={countdownValue}
        />
      ))}
      
      <FinishLine />
      <StartLine />
      <Tagger isItLooking={isItLooking} />
    </div>
  );
};

export default RaceTrack;
