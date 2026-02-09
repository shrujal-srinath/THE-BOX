// src/services/gameService.ts
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { getSportConfig, getDefaultPlayerStats, getDefaultTeamStats } from './sportLoader';
import type { Game, SportType, Team } from '../core/types';

export const createGame = async (params: {
  sport: SportType;
  hostId: string;
  hostName: string;
  gameName: string;
  teamA: { name: string; color: string };
  teamB: { name: string; color: string };
  trackPlayerStats: boolean;
}): Promise<string> => {
  const gameCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  const config = getSportConfig(params.sport);

  const teamA: Team = {
    id: 'A',
    name: params.teamA.name,
    color: params.teamA.color,
    score: 0,
    stats: getDefaultTeamStats(params.sport),
    players: [],
    timeouts: config.rules.team.timeoutsPerPeriod || 0,
    timeoutsUsed: 0,
    custom: {},
  };

  const teamB: Team = {
    id: 'B',
    name: params.teamB.name,
    color: params.teamB.color,
    score: 0,
    stats: getDefaultTeamStats(params.sport),
    players: [],
    timeouts: config.rules.team.timeoutsPerPeriod || 0,
    timeoutsUsed: 0,
    custom: {},
  };

  const game: Game = {
    id: gameCode,
    code: gameCode,
    sport: params.sport,
    hostId: params.hostId,
    hostName: params.hostName,
    status: 'live',
    createdAt: Date.now(),
    lastUpdate: Date.now(),
    settings: {
      gameName: params.gameName,
      rules: config.rules,
      trackPlayerStats: params.trackPlayerStats,
      allowSpectators: true,
      enableLiveStream: false,
    },
    state: {
      currentPeriod: 1,
      clock: {
        game: {
          minutes: config.rules.periodConfig.duration,
          seconds: 0,
          tenths: 0,
        },
        gameRunning: false,
        secondary: config.rules.timing.secondaryClockDuration || null,
        secondaryRunning: false,
      },
      isRunning: false,
      possession: 'A',
      custom: {},
    },
    teams: { A: teamA, B: teamB },
    actionLog: [],
    metadata: {},
  };

  await setDoc(doc(db, 'games', gameCode), game);
  return gameCode;
};

export const subscribeToGame = (gameCode: string, callback: (game: Game | null) => void) => {
  const gameRef = doc(db, 'games', gameCode);
  return onSnapshot(gameRef, (snapshot) => {
    if (snapshot.exists()) {
      callback(snapshot.data() as Game);
    } else {
      callback(null);
    }
  });
};

export const updateGame = async (gameCode: string, updates: Partial<Game>) => {
  const gameRef = doc(db, 'games', gameCode);
  await updateDoc(gameRef, { ...updates, lastUpdate: Date.now() });
};