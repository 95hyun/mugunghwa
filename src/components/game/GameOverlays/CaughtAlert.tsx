import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './GameOverlays.css';

interface CaughtAlertProps {
  playersMovingCount: number;
}

const CaughtAlert: React.FC<CaughtAlertProps> = ({ playersMovingCount }) => {
  return (
    <AnimatePresence>
      {playersMovingCount > 0 && (
        <motion.div 
          className="caught-alert-overlay"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <div className="caught-alert-content">
            <h3>🚨 걸렸다! {playersMovingCount}명이 움직이고 있습니다!</h3>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CaughtAlert;
