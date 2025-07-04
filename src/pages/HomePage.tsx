import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { Player } from '../types/game';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [playerInput, setPlayerInput] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [runningAnimation, setRunningAnimation] = useState<1 | 2>(1);
  const navigate = useNavigate();

  // 콤마로 구분된 참가자 이름 파싱
  const parsePlayerNames = (input: string): string[] => {
    return input
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0);
  };

  // 참가자 입력 처리
  const handlePlayerInput = (value: string) => {
    setPlayerInput(value);
    
    const names = parsePlayerNames(value);
    
    // 유효성 검증
    if (names.length > 10) {
      setError('최대 10명까지만 참가할 수 있습니다.');
      return;
    }
    
    // 중복 이름 체크
    const duplicates = names.filter((name, index) => names.indexOf(name) !== index);
    if (duplicates.length > 0) {
      setError(`중복된 이름이 있습니다: ${duplicates.join(', ')}`);
      return;
    }
    
    // 이름 길이 체크
    const longNames = names.filter(name => name.length > 10);
    if (longNames.length > 0) {
      setError(`이름이 너무 깁니다 (10자 이하): ${longNames.join(', ')}`);
      return;
    }
    
    setError('');
  };

  // 실시간 플레이어 객체 생성
  const players: Player[] = useMemo(() => {
    const validNames = parsePlayerNames(playerInput);
    const playerColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    
    return validNames.map((name, index) => ({
      id: `player-${index + 1}`,
      name,
      position: 0,
      isEliminated: false,
      eliminatedRound: null,
      rank: null,
      color: playerColors[index % playerColors.length]
    }));
  }, [playerInput]);

  // 게임 시작
  const startGame = () => {
    const validNames = parsePlayerNames(playerInput);
    
    if (validNames.length < 2) {
      setError('최소 2명의 참가자가 필요합니다.');
      return;
    }

    if (validNames.length > 10) {
      setError('최대 10명까지만 참가할 수 있습니다.');
      return;
    }

    // 중복 체크
    if (validNames.length !== new Set(validNames).size) {
      setError('중복된 이름이 있습니다.');
      return;
    }

    // 에러가 있으면 게임 시작 방지
    if (error) {
      return;
    }

    navigate('/game', { state: { players: players } });
  };

  // 달리기 애니메이션 효과 (항상 실행)
  useEffect(() => {
    const animationInterval = setInterval(() => {
      setRunningAnimation(prev => prev === 1 ? 2 : 1);
    }, 500); // 0.5초마다 애니메이션 프레임 변경
    
    return () => clearInterval(animationInterval);
  }, []);

  return (
    <>
      <Helmet>
        <title>무궁화 꽃이 피었습니다 | 온라인 등수 추첨 게임</title>
        <meta name="description" content="친구들과 함께 즐기는 무궁화 꽃이 피었습니다 게임! 2-10명이 참가할 수 있는 온라인 등수 추첨 게임. 지금 바로 무료로 플레이하세요." />
        <meta name="keywords" content="무궁화꽃이피었습니다, 등수추첨, 온라인게임, 친구게임, 무료게임, 웹게임" />
        <link rel="canonical" href="https://mugunhwarun.netlify.app/" />
        <meta property="og:title" content="무궁화 꽃이 피었습니다 - 온라인 등수 추첨 게임" />
        <meta property="og:description" content="친구들과 함께 즐기는 재미있는 등수 추첨 게임" />
        <meta property="og:url" content="https://mugunhwarun.netlify.app/" />
      </Helmet>
      
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

        {/* 1. 게임 규칙 - 최상단 배치 */}
        <motion.div 
          className="game-rules-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <div className="rules-grid">
            <div className="rule-item">
              <div className="rule-icon">🏃‍♂️</div>
              <div className="rule-content">
                <div className="rule-text">술래가 "무궁화 꽃이 피었습니다" 외칠 때</div>
                <div className="rule-sub">자유롭게 이동 가능</div>
              </div>
            </div>
            
            <div className="rule-item">
              <div className="rule-icon danger">⚠️</div>
              <div className="rule-content">
                <div className="rule-text">술래가 돌아보는 순간 움직이면</div>
                <div className="rule-sub">즉시 탈락!</div>
              </div>
            </div>
            
            <div className="rule-item">
              <div className="rule-icon success">🏆</div>
              <div className="rule-content">
                <div className="rule-text">가장 먼저 골인하거나</div>
                <div className="rule-sub">마지막까지 살아남으면 승리</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 2. 참가자 설정 섭션 */}
        <motion.div 
          className="players-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <div className="game-start-button-container">
            <Button
              onClick={startGame}
              variant="primary"
              size="medium"
              disabled={players.length < 2}
            >
              게임 시작
            </Button>
          </div>
          
          <div className="player-input-container">
            <Input
              value={playerInput}
              onChange={handlePlayerInput}
              placeholder="참가자 이름을 콤마(,)로 구분해서 입력하세요. 예: 홍길동, 김영희, 박철수"
              maxLength={200}
            />
            <div className="input-guide">
              <span className="guide-text">최소 2명, 최대 10명까지 참가 가능</span>
            </div>
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
        </motion.div>

        {/* 3. 참가자 미리보기 섭션 - 항상 표시 */}
        <motion.div 
          className="player-preview-section"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          
          {players.length > 0 ? (
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
          ) : (
            <div className="empty-preview">
              <span className="empty-text">참가자가 설정되지 않았습니다</span>
            </div>
          )}
        </motion.div>

        
        </motion.div>
      </div>
    </>
  );
};

export default HomePage;
