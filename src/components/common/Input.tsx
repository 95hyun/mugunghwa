import React from 'react';
import { motion } from 'framer-motion';
import './Input.css';

interface InputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  maxLength?: number;
  error?: string;
  label?: string;
}

const Input: React.FC<InputProps> = ({
  value,
  onChange,
  placeholder,
  disabled = false,
  maxLength,
  error,
  label
}) => {
  return (
    <motion.div 
      className="input-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {label && (
        <label className="input-label">{label}</label>
      )}
      <motion.input
        className={`input ${error ? 'input--error' : ''}`}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        style={{ 
          fontSize: '16px', // iOS 자동 줌 방지를 위한 16px 강제 설정
          WebkitAppearance: 'none', // iOS 기본 스타일 제거
          appearance: 'none',
          WebkitTapHighlightColor: 'transparent', // 탭 하이라이트 제거
          touchAction: 'manipulation' // 더블탭 줌 방지
        }}
        whileFocus={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      {error && (
        <motion.span 
          className="input-error"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.span>
      )}
    </motion.div>
  );
};

export default Input;