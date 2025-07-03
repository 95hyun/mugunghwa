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
        <motion.div 
          className="syllable-overlay"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className={`syllable-text ${speed}`}>
            {syllables.slice(0, currentIndex + 1).join('')}
          </h1>
          <SyllableProgress 
            syllables={syllables}
            currentIndex={currentIndex}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SyllableOverlay;
