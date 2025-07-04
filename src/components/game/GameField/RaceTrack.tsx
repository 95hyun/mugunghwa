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
  // 선두 계산: 살아있고 아직 승리하지 않은 플레이어들 중 최고 position
  const activePlayers = players.filter(p => !p.isEliminated && p.position < 200);
  const maxPosition = activePlayers.length > 0 ? Math.max(...activePlayers.map(p => p.position)) : 0;
  const hasLeader = maxPosition > 0; // 누군가 이동을 시작했을 때만 선두 표시

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
          isLeader={hasLeader && !player.isEliminated && player.position < 200 && player.position === maxPosition}
        />
      ))}
      
      <FinishLine />
      <StartLine />
      <Tagger isItLooking={isItLooking} />
    </div>
  );
};

export default RaceTrack;
