import { useState, useCallback, useRef } from 'react';

interface AnimationState {
  isAnimating: boolean;
  currentAnimation: string | null;
  animationProgress: number;
}

interface UseAnimationReturn {
  animationState: AnimationState;
  startAnimation: (animationName: string, duration?: number) => Promise<void>;
  stopAnimation: () => void;
  setAnimationProgress: (progress: number) => void;
}

export const useAnimation = (): UseAnimationReturn => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    isAnimating: false,
    currentAnimation: null,
    animationProgress: 0
  });

  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startAnimation = useCallback((animationName: string, duration = 1000): Promise<void> => {
    return new Promise((resolve) => {
      // 기존 애니메이션 정리
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      setAnimationState({
        isAnimating: true,
        currentAnimation: animationName,
        animationProgress: 0
      });

      const startTime = Date.now();

      const updateProgress = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        setAnimationState(prev => ({
          ...prev,
          animationProgress: progress
        }));

        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(updateProgress);
        } else {
          setAnimationState({
            isAnimating: false,
            currentAnimation: null,
            animationProgress: 1
          });
          resolve();
        }
      };

      animationFrameRef.current = requestAnimationFrame(updateProgress);
    });
  }, []);

  const stopAnimation = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setAnimationState({
      isAnimating: false,
      currentAnimation: null,
      animationProgress: 0
    });
  }, []);

  const setAnimationProgress = useCallback((progress: number) => {
    setAnimationState(prev => ({
      ...prev,
      animationProgress: Math.max(0, Math.min(1, progress))
    }));
  }, []);

  return {
    animationState,
    startAnimation,
    stopAnimation,
    setAnimationProgress
  };
};

// 특정 애니메이션 타입들을 위한 헬퍼 훅들
export const useGameAnimations = () => {
  const { animationState, startAnimation, stopAnimation } = useAnimation();

  const showGameText = useCallback(() => {
    return startAnimation('gameText', 2000);
  }, [startAnimation]);

  const movePlayersAnimation = useCallback(() => {
    return startAnimation('movePlayers', 1500);
  }, [startAnimation]);

  const taggerLookAnimation = useCallback(() => {
    return startAnimation('taggerLook', 500);
  }, [startAnimation]);

  const eliminationAnimation = useCallback(() => {
    return startAnimation('elimination', 1000);
  }, [startAnimation]);

  return {
    animationState,
    showGameText,
    movePlayersAnimation,
    taggerLookAnimation,
    eliminationAnimation,
    stopAnimation
  };
};
