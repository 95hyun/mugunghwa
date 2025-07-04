import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TaggerProps {
  isItLooking: boolean;
}

const Tagger: React.FC<TaggerProps> = ({ isItLooking }) => {
  return (
    <div className="tagger">
      <AnimatePresence mode="wait">
        <motion.img 
          key={isItLooking ? "front" : "back"}
          src={isItLooking ? "/character/gaksital_front.webp" : "/character/gaksital_back.webp"}
          alt={isItLooking ? "술래 정면" : "술래 뒤돌아보기"}
          className="tagger-image"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        />
      </AnimatePresence>
    </div>
  );
};

export default Tagger;
