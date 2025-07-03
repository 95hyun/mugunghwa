import React from 'react';
import { motion } from 'framer-motion';

interface SafeAlertProps {
  isItLooking: boolean;
  playersMovingCount: number;
}

const SafeAlert: React.FC<SafeAlertProps> = ({ isItLooking, playersMovingCount }) => {
  if (!isItLooking || playersMovingCount > 0) return null;

  return (
    <motion.div 
      className="safe-alert floating-alert"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h3>✅ 모두 안전합니다!</h3>
    </motion.div>
  );
};

export default SafeAlert;
