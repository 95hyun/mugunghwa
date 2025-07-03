import React from 'react';

interface SyllableProgressProps {
  syllables: string[];
  currentIndex: number;
}

const SyllableProgress: React.FC<SyllableProgressProps> = ({ syllables, currentIndex }) => {
  return (
    <div className="syllable-progress">
      {syllables.map((syllable, index) => (
        <span 
          key={index}
          className={`syllable-dot ${index <= currentIndex ? 'active' : ''}`}
        >
          {syllable}
        </span>
      ))}
    </div>
  );
};

export default SyllableProgress;
