// src/services/gameService.ts
/**
 * GAME SERVICE - MULTI-SPORT FIREBASE OPERATIONS
 * 
 * This service handles Firebase CRUD for games, but now supports ANY sport.
 * It uses the sport configuration system to initialize games correctly.
 */

import {
  doc,
  setDoc,
  updateDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import type { Game, SportType, Team, Player } from '../core/types';
import {
  getSportConfig,
  createInitialGameState,
  getDefaultPlayerStats,
  getDefaultTeamStats,
} from './sportLoader';

// ============================================
// GAME CREATION
// ============================================

/**
 * Generate unique 6-digit game code
 */
const generateGameCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Create a new game for any sport
 */
export const createGame = async (params: {
  sport: SportType;
  hostId: string;
  hostName?: string;
  gameName: string;
  venue?: string;
  teamA: { name: string; color: string; players?: Player[] };
  teamB: { name: string; color: string; players?: Player[] };
  trackPlayerStats: boolean;
  customRules?: Partial<any>; // Sport-specific rule overrides
}): Promise<string> => {
  const code = generateGameCode();
  const config = getSportConfig(params.sport);

  // Create teams with sport-specific stats
  const teamAStats = getDefaultTeamStats(params.sport);
  const teamBStats = getDefaultTeamStats(params.sport);

  const teamA: Team = {
    id: 'A',
    name: params.teamA.name,
    color: params.teamA.color,
    score: 0,
    stats: teamAStats,
    players: params.trackPlayerStats ? (params.teamA.players || []) : [],
    timeouts: config.rules.team.timeoutsPerPeriod || 0,
    timeoutsUsed: 0,
    custom: {},
  };

  const teamB: Team = {
    id: 'B',
    name: params.teamB.name,
    color: params.teamB.color,
    score: 0,
    stats: teamBStats,
    players: params.trackPlayerStats ? (params.teamB.players || []) : [],
    timeouts: config.rules.team.timeoutsPerPeriod || 0,
    timeoutsUsed: 0,
    custom: {},
  };

  // Initialize game state for this sport
  const initialState = createInitialGameState(params.sport);

  // Create game object
  const game: Game = {
    id: code,
    code,
    sport: params.sport,
    hostId: params.hostId,
    hostName: params.hostName,
    status: 'live',
    createdAt: Date.now(),
    lastUpdate: Date.now(),

    settings: {
      gameName: params.gameName,
      venue: params.venue,
      rules: config.rules,
      trackPlayerStats: params.trackPlayerStats,
      allowSpectators: true,
      enableLiveStream: true,
    },

    state: initialState,

    teams: {
      A: teamA,
      B: teamB,
    },

    actionLog: [],

    metadata: {
      tags: [params.sport],
    },
  };

  // Save to Firebase
  const gameRef = doc(db, 'games', code);
  await setDoc(gameRef, game);

  console.log(`[GameService] ✅ Created ${params.sport} game ${code}`);
  return code;
};

// ============================================
// GAME RETRIEVAL
// ============================================

/**
 * Subscribe to a specific game (real-time updates)
 */
export const subscribeToGame = (
  code: string,
  callback: (game: Game | null) => void
): (() => void) => {
  if (!code) {
    console.warn('[GameService] No game code provided');
    callback(null);
    return () => {};
  }

  const gameRef = doc(db, 'games', code);

  const unsubscribe = onSnapshot(
    gameRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const gameData = snapshot.data() as Game;
        callback(gameData);
      } else {
        console.warn(`[GameService] Game ${code} not found`);
        callback(null);
      }
    },
    (error) => {
      console.error('[GameService] Subscription error:', error);
      callback(null);
    }
  );

  return unsubscribe;
};

/**
 * Get a game by code (one-time fetch)
 */
export const getGame = async (code: string): Promise<Game | null> => {
  if (!code) return null;

  try {
    const gameRef = doc(db, 'games', code);
    const snapshot = await getDoc(gameRef);

    if (snapshot.exists()) {
      return snapshot.data() as Game;
    }

    return null;
  } catch (error) {
    console.error('[GameService] Failed to get game:', error);
    return null;
  }
};

/**
 * Subscribe to all live games
 */
export const subscribeToLiveGames = (
  callback: (games: Game[]) => void,
  sportFilter?: SportType
): (() => void) => {
  let gamesQuery = query(collection(db, 'games'), where('status', '==', 'live'));

  if (sportFilter) {
    gamesQuery = query(gamesQuery, where('sport', '==', sportFilter));
  }

  const unsubscribe = onSnapshot(
    gamesQuery,
    (snapshot) => {
      const games: Game[] = [];
      snapshot.forEach((doc) => {
        games.push(doc.data() as Game);
      });
      callback(games);
    },
    (error) => {
      console.error('[GameService] Live games subscription error:', error);
      callback([]);
    }
  );

  return unsubscribe;
};

/**
 * Get all games for a specific host
 */
export const getGamesByHost = async (
  hostId: string,
  sportFilter?: SportType
): Promise<Game[]> => {
  if (!hostId) return [];

  try {
    let gamesQuery = query(
      collection(db, 'games'),
      where('hostId', '==', hostId),
      where('status', '==', 'live')
    );

    if (sportFilter) {
      gamesQuery = query(gamesQuery, where('sport', '==', sportFilter));
    }

    const snapshot = await getDocs(gamesQuery);
    const games: Game[] = [];

    snapshot.forEach((doc) => {
      games.push(doc.data() as Game);
    });

    return games;
  } catch (error) {
    console.error('[GameService] Failed to get games by host:', error);
    return [];
  }
};

// ============================================
// GAME UPDATES
// ============================================

/**
 * Update game state (generic field update)
 */
export const updateGame = async (code: string, updates: Partial<Game>): Promise<void> => {
  if (!code) {
    console.error('[GameService] No game code provided');
    return;
  }

  try {
    const gameRef = doc(db, 'games', code);

    await updateDoc(gameRef, {
      ...updates,
      lastUpdate: Date.now(),
    });

    console.log(`[GameService] ✅ Updated game ${code}`);
  } catch (error) {
    console.error(`[GameService] ❌ Failed to update game:`, error);
    throw error;
  }
};

/**
 * Update a specific nested field
 */
export const updateGameField = async (
  code: string,
  path: string,
  value: any
): Promise<void> => {
  if (!code) {
    console.error('[GameService] No game code provided');
    return;
  }

  try {
    const gameRef = doc(db, 'games', code);

    await updateDoc(gameRef, {
      [path]: value,
      lastUpdate: Date.now(),
    });

    console.log(`[GameService] ✅ Updated ${path} in game ${code}`);
  } catch (error) {
    console.error(`[GameService] ❌ Failed to update ${path}:`, error);
    throw error;
  }
};

// ============================================
// GAME DELETION
// ============================================

/**
 * Delete a game
 */
export const deleteGame = async (code: string): Promise<void> => {
  if (!code) return;

  try {
    const gameRef = doc(db, 'games', code);
    await deleteDoc(gameRef);
    console.log(`[GameService] ✅ Deleted game ${code}`);
  } catch (error) {
    console.error('[GameService] Failed to delete game:', error);
    throw error;
  }
};

// ============================================
// PLAYER MANAGEMENT
// ============================================

/**
 * Create a default player with sport-specific stats
 */
export const createPlayer = (
  sportType: SportType,
  id: string,
  number?: string,
  name?: string
): Player => {
  const stats = getDefaultPlayerStats(sportType);

  return {
    id,
    number: number || '',
    name: name || '',
    isActive: false,
    isStarter: false,
    stats,
    disqualified: false,
    injured: false,
  };
};

/**
 * Add a player to a team
 */
export const addPlayerToTeam = async (
  code: string,
  team: 'A' | 'B',
  player: Player
): Promise<void> => {
  const game = await getGame(code);
  if (!game) {
    throw new Error('Game not found');
  }

  game.teams[team].players.push(player);

  await updateGameField(code, `teams.${team}.players`, game.teams[team].players);
};

// ============================================
// BACKWARDS COMPATIBILITY
// ============================================

/**
 * Alias for getGame (for backwards compatibility)
 */
export const getGameByCode = getGame;