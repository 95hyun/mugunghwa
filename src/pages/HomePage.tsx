import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Player } from '../types/game';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [playerNames, setPlayerNames] = useState<string[]>(['', '']);
  const [error, setError] = useState<string>('');
  const [showPreparation, setShowPreparation] = useState<boolean>(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [runningAnimation, setRunningAnimation] = useState<1 | 2>(1);
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
    if (playerNames.length > 2) {
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

  // 게임 준비 모드로 전환
  const showGamePreparation = () => {
    const validNames = playerNames.filter(name => name.trim() !== '');
    
    if (validNames.length < 2) {
      setError('최소 2명의 참가자가 필요합니다.');
      return;
    }

    if (validNames.length !== new Set(validNames).size) {
      setError('중복된 이름이 있습니다.');
      return;
    }

    // 플레이어 객체 생성
    const playerColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    const newPlayers: Player[] = validNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name,
      position: 0,
      isEliminated: false,
      eliminatedRound: null,
      rank: null,
      color: playerColors[index % playerColors.length]
    }));

    setPlayers(newPlayers);
    setShowPreparation(true);
    setError('');
  };

  // 게임 시작
  const startGame = () => {
    const validNames = playerNames.filter(name => name.trim() !== '');
    navigate('/game', { state: { playerNames: validNames } });
  };

  // 참가자 설정 화면으로 돌아가기
  const backToPlayerSetup = () => {
    setShowPreparation(false);
    setPlayers([]);
  };

  // 달리기 애니메이션 효과 (게임 준비 모드일 때만)
  useEffect(() => {
    let animationInterval: NodeJS.Timeout;
    
    if (showPreparation) {
      animationInterval = setInterval(() => {
        setRunningAnimation(prev => prev === 1 ? 2 : 1);
      }, 500); // 0.5초마다 애니메이션 프레임 변경
    }
    
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [showPreparation]);

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
          🌺 무궁화 꽃이 피었습니다 🌺
        </motion.h1>
        
        <motion.p 
          className="home-subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          등수 추첨 게임
        </motion.p>

        <div className="players-section">
          <div className="section-header">
            <h3>참가자 설정</h3>
            <button
              className="add-player-btn"
              onClick={addPlayer}
              disabled={playerNames.length >= 10}
              title="참가자 추가"
            >
              <span className="plus-icon">+</span>
            </button>
          </div>
          
          <div className="players-list">
            {playerNames.map((name, index) => (
              <motion.div 
                key={index}
                className="player-input-row"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="player-number">{index + 1}</div>
                <div className="input-wrapper">
                  <Input
                    value={name}
                    onChange={(value) => updatePlayerName(index, value)}
                    placeholder={`참가자 ${index + 1} 이름`}
                    maxLength={10}
                  />
                </div>
                <button
                  className="remove-player-btn"
                  onClick={() => removePlayer(index)}
                  disabled={playerNames.length <= 2}
                  title="참가자 삭제"
                >
                  <span className="minus-icon">−</span>
                </button>
              </motion.div>
            ))}
          </div>
          
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

        {!showPreparation && (
          <div className="actions">
            <Button
              onClick={showGamePreparation}
              variant="primary"
              size="large"
            >
              게임 시작
            </Button>
          </div>
        )}

        {showPreparation && (
          <motion.div 
            className="preparation-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h3>게임 준비</h3>
            <p>참가자 {players.length}명이 준비되었습니다.</p>
            
            <div className="player-preview-list">
              {players.map((player, idx) => (
                <div key={player.id} className="player-preview-card">
                  <div className="player-preview-number">{idx + 1}</div>
                  <img
                    src={`/character/running_man_${runningAnimation}.png`}
                    alt={`${player.name} 아바타`}
                    className="player-preview-image"
                  />
                  <div 
                    className="player-preview-name" 
                    style={{ backgroundColor: player.color }}
                  >
                    {player.name}
                  </div>
                </div>
              ))}
            </div>
            
            <p className="game-rules">
              🎯 <strong>게임 규칙:</strong><br/>
              • 술래가 뒤돌고 "무궁화 꽃이 피었습니다"를 외치는 동안 이동 가능<br/>
              • 술래가 돌아볼 때 움직이면 탈락!<br/>
              • 먼저 골인하거나 마지막까지 살아남으면 승리!
            </p>
            
            <div className="preparation-actions">
              <Button
                onClick={backToPlayerSetup}
                variant="secondary"
                size="medium"
              >
                뒤로가기
              </Button>
              <Button
                onClick={startGame}
                variant="primary"
                size="large"
              >
                게임 시작
              </Button>
            </div>
          </motion.div>
        )}
        
        {!showPreparation && (
          <div className="game-info">
            <p>ℹ️ 최소 2명, 최대 10명까지 참가 가능</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default HomePage;
