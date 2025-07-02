import { useState, useCallback, useRef } from 'react';

interface UseSoundReturn {
  isEnabled: boolean;
  toggleSound: () => void;
  playSound: (soundName: string) => void;
  setVolume: (volume: number) => void;
  volume: number;
}

export const useSound = (): UseSoundReturn => {
  const [isEnabled, setIsEnabled] = useState(false); // 기본적으로 사운드 비활성화
  const [volume, setVolumeState] = useState(0.5);
  const audioContextRef = useRef<AudioContext | null>(null);

  const toggleSound = useCallback(() => {
    setIsEnabled(prev => !prev);
  }, []);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
  }, []);

  const playSound = useCallback((soundName: string) => {
    if (!isEnabled) return;

    try {
      // 기본적인 사운드 효과를 위한 Web Audio API 사용
      // 실제 구현에서는 사운드 파일을 로드하거나 
      // 간단한 톤을 생성할 수 있습니다.
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      const audioContext = audioContextRef.current;
      
      // 간단한 효과음 생성 (실제로는 사운드 파일을 사용하는 것이 좋습니다)
      switch (soundName) {
        case 'gameStart':
          playTone(audioContext, 440, 0.2, volume);
          break;
        case 'playerMove':
          playTone(audioContext, 220, 0.1, volume * 0.5);
          break;
        case 'taggerLook':
          playTone(audioContext, 880, 0.3, volume);
          break;
        case 'elimination':
          playTone(audioContext, 110, 0.5, volume);
          break;
        case 'gameWin':
          // 승리 멜로디
          setTimeout(() => playTone(audioContext, 523, 0.2, volume), 0);
          setTimeout(() => playTone(audioContext, 659, 0.2, volume), 200);
          setTimeout(() => playTone(audioContext, 784, 0.4, volume), 400);
          break;
        default:
          console.warn(`Unknown sound: ${soundName}`);
      }
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, [isEnabled, volume]);

  return {
    isEnabled,
    toggleSound,
    playSound,
    setVolume,
    volume
  };
};

// 간단한 톤 생성 함수
const playTone = (
  audioContext: AudioContext,
  frequency: number,
  duration: number,
  volume: number
) => {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};
