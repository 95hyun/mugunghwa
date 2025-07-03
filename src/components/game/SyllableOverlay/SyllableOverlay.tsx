import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SyllableProgress from './SyllableProgress';
import './SyllableOverlay.css';

interface SyllableOverlayProps {
  isVisible: boolean;
  currentIndex: number;
  syllables: string[];
  speed: 'normal' | 'fast' | 'slow';
  countdownValue: number | string | null;
}

const SyllableOverlay: React.FC<SyllableOverlayProps> = ({ 
  isVisible, 
  currentIndex, 
  syllables, 
  speed,
  countdownValue 
}) => {
  return (
    <AnimatePresence>
      {isVisible && currentIndex >= 0 && countdownValue === null && (
        <div className="syllable-overlay">
          <motion.h1 
            className={`syllable-text ${speed}`}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {syllables.slice(0, currentIndex + 1).join('')}
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <SyllableProgress 
              syllables={syllables}
              currentIndex={currentIndex}
            />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SyllableOverlay;
