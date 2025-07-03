import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CountdownOverlay.css';

interface CountdownOverlayProps {
  countdownValue: number | string | null;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ countdownValue }) => {
  return (
    <AnimatePresence>
      {countdownValue !== null && (
        <motion.div 
          className="countdown-overlay"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className={`countdown-display ${countdownValue === "시작!" ? "countdown-start" : "countdown-number"}`}
            key={countdownValue} // key를 추가하여 각 값마다 새로운 애니메이션
            initial={{ scale: 0.5, rotate: countdownValue === "시작!" ? -20 : -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: countdownValue === "시작!" ? 1.2 : 1.5, rotate: countdownValue === "시작!" ? 20 : 10, opacity: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: countdownValue === "시작!" ? 400 : 300, 
              damping: countdownValue === "시작!" ? 20 : 15 
            }}
          >
            {countdownValue}
          </motion.div>
          <motion.p 
            className="countdown-text"
            key={`text-${countdownValue}`} // 텍스트도 각 값마다 애니메이션
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {countdownValue === "시작!" ? "무궁화 꽃이 피었습니다!" : "게임 시작 준비"}
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CountdownOverlay;
