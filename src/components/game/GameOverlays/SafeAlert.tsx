import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GameOverlays.css';

interface SafeAlertProps {
  isItLooking: boolean;
  playersMovingCount: number;
}

const SafeAlert: React.FC<SafeAlertProps> = ({ isItLooking, playersMovingCount }) => {
  return (
    <AnimatePresence>
      {isItLooking && playersMovingCount === 0 && (
        <motion.div 
          className="safe-alert-overlay"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <div className="safe-alert-content">
            <h3>✅ 모두 안전합니다!</h3>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SafeAlert;
