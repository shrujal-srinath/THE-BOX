// src/services/sportLoader.ts
/**
 * SPORT CONFIGURATION LOADER
 * 
 * Dynamically loads sport configurations and provides them to the app.
 * This is the "plugin registry" for all sports.
 */

import type { SportConfig, SportType } from '../core/types';
import { basketballConfig } from '../sports/basketball/config';
import { badmintonConfig } from '../sports/badminton/config';
import { kabaddiConfig } from '../sports/kabaddi/config';

// ============================================
// SPORT REGISTRY
// ============================================

const SPORT_CONFIGS: Record<SportType, SportConfig> = {
  basketball: basketballConfig,
  badminton: badmintonConfig,
  kabaddi: kabaddiConfig,
};

// ============================================
// PUBLIC API
// ============================================

/**
 * Get configuration for a specific sport
 */
export const getSportConfig = (sportType: SportType): SportConfig => {
  const config = SPORT_CONFIGS[sportType];
  
  if (!config) {
    throw new Error(`Sport configuration not found: ${sportType}`);
  }
  
  if (!config.meta.enabled) {
    throw new Error(`Sport is disabled: ${sportType}`);
  }
  
  return config;
};

/**
 * Get all available (enabled) sports
 */
export const getAvailableSports = (): SportConfig[] => {
  return Object.values(SPORT_CONFIGS).filter(config => config.meta.enabled);
};

/**
 * Get sport metadata only (for sport selection UI)
 */
export const getSportMeta = (sportType: SportType) => {
  const config = getSportConfig(sportType);
  return config.meta;
};

/**
 * Get all sport metadata
 */
export const getAllSportMeta = () => {
  return getAvailableSports().map(config => config.meta);
};

/**
 * Check if a sport is supported
 */
export const isSportSupported = (sportType: string): sportType is SportType => {
  return sportType in SPORT_CONFIGS;
};

/**
 * Validate sport type (type guard)
 */
export const validateSportType = (sportType: string): SportType => {
  if (!isSportSupported(sportType)) {
    throw new Error(`Unsupported sport: ${sportType}`);
  }
  return sportType;
};

// ============================================
// INITIALIZATION HELPERS
// ============================================

/**
 * Get default player stats for a sport
 */
export const getDefaultPlayerStats = (sportType: SportType): Record<string, any> => {
  const config = getSportConfig(sportType);
  const stats: Record<string, any> = {};
  
  config.playerStats.forEach(stat => {
    stats[stat.id] = stat.defaultValue;
  });
  
  return stats;
};

/**
 * Get default team stats for a sport
 */
export const getDefaultTeamStats = (sportType: SportType): Record<string, any> => {
  const config = getSportConfig(sportType);
  const stats: Record<string, any> = {};
  
  config.teamStats.forEach(stat => {
    stats[stat.id] = stat.defaultValue;
  });
  
  return stats;
};

/**
 * Create initial game state for a sport
 */
export const createInitialGameState = (sportType: SportType) => {
  const config = getSportConfig(sportType);
  
  return {
    currentPeriod: 1,
    clock: {
      game: {
        minutes: config.rules.periodConfig.duration,
        seconds: 0,
        tenths: 0,
      },
      gameRunning: false,
      secondary: config.rules.timing.hasSecondaryClock 
        ? config.rules.timing.secondaryClockDuration 
        : null,
      secondaryRunning: false,
    },
    isRunning: false,
    possession: 'A' as const,
    custom: {},
  };
};

/**
 * Format period label for a sport
 */
export const formatPeriodLabel = (sportType: SportType, period: number): string => {
  const config = getSportConfig(sportType);
  return config.rules.periodConfig.label(period);
};

// ============================================
// EXPORT ALL CONFIGS (for direct access if needed)
// ============================================

export { basketballConfig, badmintonConfig, kabaddiConfig };