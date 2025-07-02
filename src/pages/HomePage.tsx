import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [playerNames, setPlayerNames] = useState<string[]>(['']);
  const [error, setError] = useState<string>('');
  const navigate = useNavigate();

  const addPlayer = () => {
    if (playerNames.length < 10) {
      setPlayerNames([...playerNames, '']);
      setError('');
    } else {
      setError('최대 10명까지만 참가할 수 있습니다.');
    }
  };

  const removePlayer = (index: number) => {
    if (playerNames.length > 1) {
      const newNames = playerNames.filter((_, i) => i !== index);
      setPlayerNames(newNames);
      setError('');
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...playerNames];
    newNames[index] = name;
    setPlayerNames(newNames);
    
    // 중복 이름 체크
    const duplicates = newNames.filter((n, i) => n && n === name && i !== index);
    if (duplicates.length > 0) {
      setError('중복된 이름이 있습니다.');
    } else {
      setError('');
    }
  };

  const startGame = () => {
    const validNames = playerNames.filter(name => name.trim() !== '');
    
    if (validNames.length < 2) {
      setError('최소 2명의 참가자가 필요합니다.');
      return;
    }

    if (validNames.length !== new Set(validNames).size) {
      setError('중복된 이름이 있습니다.');
      return;
    }

    // 게임 페이지로 이동 (이름들을 state로 전달)
    navigate('/game', { state: { playerNames: validNames } });
  };

  return (
    <div className="home-page">
      <motion.div 
        className="home-container"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <motion.h1 
          className="home-title"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
        >
          🏃‍♂️ 무궁화 꽃이 피었습니다 🏃‍♀️
        </motion.h1>
        
        <motion.p 
          className="home-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          참가자들의 이름을 입력하고 등수 추첨을 시작해보세요!
        </motion.p>

        <div className="players-section">
          <h3>참가자 명단</h3>
          
          {playerNames.map((name, index) => (
            <motion.div 
              key={index}
              className="player-input-row"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Input
                value={name}
                onChange={(value) => updatePlayerName(index, value)}
                placeholder={`참가자 ${index + 1} 이름`}
                maxLength={10}
              />
              {playerNames.length > 1 && (
                <Button
                  onClick={() => removePlayer(index)}
                  variant="danger"
                  size="small"
                >
                  삭제
                </Button>
              )}
            </motion.div>
          ))}
          
          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </motion.div>
          )}
        </div>

        <div className="actions">
          <Button
            onClick={addPlayer}
            variant="secondary"
            disabled={playerNames.length >= 10}
          >
            참가자 추가
          </Button>
          
          <Button
            onClick={startGame}
            variant="primary"
            size="large"
          >
            게임 시작!
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default HomePage;
