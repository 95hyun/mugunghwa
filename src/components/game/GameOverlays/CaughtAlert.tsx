import React from 'react';
import { motion } from 'framer-motion';

interface CaughtAlertProps {
  playersMovingCount: number;
}

const CaughtAlert: React.FC<CaughtAlertProps> = ({ playersMovingCount }) => {
  if (playersMovingCount === 0) return null;

  return (
    <motion.div 
      className="caught-alert floating-alert"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <h3>🚨 걸렸다! {playersMovingCount}명이 움직이고 있습니다!</h3>
    </motion.div>
  );
};

export default CaughtAlert;
