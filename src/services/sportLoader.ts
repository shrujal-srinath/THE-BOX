// src/services/sportLoader.ts
import type { SportConfig, SportType } from '../core/types';
import { basketballConfig } from '../sports/basketball/config';
import { badmintonConfig } from '../sports/badminton/config';

const REGISTRY: Record<string, SportConfig> = {
  basketball: basketballConfig,
  badminton: badmintonConfig,
};

export const getSportConfig = (type: SportType): SportConfig => {
  const config = REGISTRY[type];
  if (!config) {
      // Fallback to basketball if unknown, or throw
      console.warn(`Sport ${type} not found, defaulting to basketball`);
      return basketballConfig; 
  }
  return config;
};