// src/services/sportLoader.ts
import type { SportType, SportConfig, SportMeta, TeamStats, PlayerStats } from '../core/types';
import { basketballConfig } from '../sports/basketball/config';
import { badmintonConfig } from '../sports/badminton/config';
import { kabaddiConfig } from '../sports/kabaddi/config';

const sportConfigs: Record<SportType, SportConfig> = {
  basketball: basketballConfig,
  badminton: badmintonConfig,
  kabaddi: kabaddiConfig,
};

export const getSportConfig = (sport: SportType): SportConfig => {
  return sportConfigs[sport];
};

export const getAllSportMeta = (): SportMeta[] => {
  return Object.values(sportConfigs).map(config => config.meta);
};

export const getAvailableSports = (): SportType[] => {
  return Object.keys(sportConfigs) as SportType[];
};

export const getDefaultTeamStats = (sport: SportType): TeamStats => {
  const config = getSportConfig(sport);
  const stats: TeamStats = { score: 0 };
  
  config.teamStats.forEach(stat => {
    stats[stat.id] = stat.defaultValue;
  });
  
  return stats;
};

export const getDefaultPlayerStats = (sport: SportType): PlayerStats => {
  const config = getSportConfig(sport);
  const stats: PlayerStats = { points: 0 };
  
  config.playerStats.forEach(stat => {
    stats[stat.id] = stat.defaultValue as number;
  });
  
  return stats;
};