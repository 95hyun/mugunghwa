import React from 'react';
import { motion } from 'framer-motion';

export interface FinishedPlayer {
  id: string;
  name: string;
  rank: number;
}

interface LiveRankingsProps {
  finishedPlayers: FinishedPlayer[];
}

const LiveRankings: React.FC<LiveRankingsProps> = ({ finishedPlayers }) => {
  if (finishedPlayers.length === 0) return null;

  return (
    <motion.div 
      className="live-rankings floating-rankings"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3>🏆 골인 순서</h3>
      <div className="ranking-list">
        {finishedPlayers.map((player, index) => (
          <motion.div
            key={player.id}
            className="ranking-item"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <span className="rank-number">#{player.rank}등</span>
            <span className="ranking-player-name">{player.name}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default LiveRankings;
