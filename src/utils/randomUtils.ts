/**
 * 배열에서 랜덤하게 요소를 선택합니다
 */
export const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * 배열에서 랜덤하게 n개의 요소를 선택합니다 (중복 없음)
 */
export const getRandomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
};

/**
 * 최소값과 최대값 사이의 랜덤한 정수를 반환합니다
 */
export const getRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * 최소값과 최대값 사이의 랜덤한 실수를 반환합니다
 */
export const getRandomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * 확률에 따라 true/false를 반환합니다
 */
export const getRandomBoolean = (probability: number = 0.5): boolean => {
  return Math.random() < probability;
};

/**
 * 배열을 랜덤하게 섞습니다 (Fisher-Yates 알고리즘)
 */
export const shuffleArray = <T>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/**
 * 가중치가 있는 랜덤 선택
 */
export const getWeightedRandom = <T>(
  items: T[],
  weights: number[]
): T => {
  if (items.length !== weights.length) {
    throw new Error('Items and weights arrays must have the same length');
  }

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let randomNum = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    randomNum -= weights[i];
    if (randomNum <= 0) {
      return items[i];
    }
  }

  return items[items.length - 1];
};

/**
 * UUID v4 생성 (간단한 버전)
 */
export const generateId = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};
