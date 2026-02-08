// src/hooks/useGame.ts
/**
 * UNIVERSAL GAME HOOK
 * 
 * React hook for managing games of ANY sport.
 * Replaces the old useBasketballGame hook.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Game, SportType, ValidationResult } from '../core/types';
import { GameEngine } from '../core/GameEngine';
import { getSportConfig } from '../services/sportLoader';
import { subscribeToGame, updateGame } from '../services/gameService';

interface UseGameReturn {
  // Game data
  game: Game | null;
  config: ReturnType<typeof getSportConfig> | null;
  loading: boolean;
  error: string | null;

  // Actions
  recordScore: (team: 'A' | 'B', scoreActionId: string, playerId?: string) => Promise<ValidationResult>;
  recordViolation: (team: 'A' | 'B', violationId: string, playerId?: string) => Promise<ValidationResult>;
  callTimeout: (team: 'A' | 'B') => Promise<ValidationResult>;

  // Clock control
  toggleGameClock: () => Promise<void>;
  updateGameTime: (time: { minutes: number; seconds: number; tenths: number }) => Promise<void>;
  resetSecondaryClock: (value?: number) => Promise<void>;
  updateSecondaryClock: (value: number) => Promise<void>;

  // Period control
  advancePeriod: () => Promise<ValidationResult>;
  
  // Possession
  togglePossession: () => Promise<void>;
  setPossession: (team: 'A' | 'B') => Promise<void>;

  // Undo
  undoLastAction: () => Promise<ValidationResult>;

  // Game control
  endGame: () => Promise<void>;
  getWinner: () => 'A' | 'B' | null;
}

export const useGame = (gameCode: string): UseGameReturn => {
  const [game, setGame] = useState<Game | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const engineRef = useRef<GameEngine | null>(null);
  const configRef = useRef<ReturnType<typeof getSportConfig> | null>(null);

  // Subscribe to Firebase game updates
  useEffect(() => {
    if (!gameCode) {
      setLoading(false);
      return;
    }

    const unsubscribe = subscribeToGame(gameCode, (gameData) => {
      if (gameData) {
        setGame(gameData);
        setLoading(false);

        // Initialize engine if not already done
        if (!engineRef.current) {
          try {
            const config = getSportConfig(gameData.sport);
            configRef.current = config;
            engineRef.current = new GameEngine(gameData, config);

            // Subscribe to engine updates to sync with Firebase
            engineRef.current.subscribe(async (updatedGame) => {
              await updateGame(gameCode, updatedGame);
            });
          } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load sport config');
          }
        } else {
          // Update engine state
          engineRef.current.setState(gameData);
        }
      } else {
        setError('Game not found');
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [gameCode]);

  // ============================================
  // ACTIONS
  // ============================================

  const recordScore = useCallback(
    async (team: 'A' | 'B', scoreActionId: string, playerId?: string): Promise<ValidationResult> => {
      if (!engineRef.current) {
        return { valid: false, error: 'Game engine not initialized' };
      }

      return engineRef.current.recordScore(team, scoreActionId, playerId);
    },
    []
  );

  const recordViolation = useCallback(
    async (team: 'A' | 'B', violationId: string, playerId?: string): Promise<ValidationResult> => {
      if (!engineRef.current) {
        return { valid: false, error: 'Game engine not initialized' };
      }

      return engineRef.current.recordViolation(team, violationId, playerId);
    },
    []
  );

  const callTimeout = useCallback(
    async (team: 'A' | 'B'): Promise<ValidationResult> => {
      if (!engineRef.current) {
        return { valid: false, error: 'Game engine not initialized' };
      }

      return engineRef.current.callTimeout(team);
    },
    []
  );

  // ============================================
  // CLOCK CONTROL
  // ============================================

  const toggleGameClock = useCallback(async () => {
    if (!engineRef.current) return;
    engineRef.current.toggleGameClock();
  }, []);

  const updateGameTime = useCallback(async (time: { minutes: number; seconds: number; tenths: number }) => {
    if (!engineRef.current) return;
    engineRef.current.updateGameTime(time);
  }, []);

  const resetSecondaryClock = useCallback(async (value?: number) => {
    if (!engineRef.current) return;
    engineRef.current.resetSecondaryClock(value);
  }, []);

  const updateSecondaryClock = useCallback(async (value: number) => {
    if (!engineRef.current) return;
    engineRef.current.updateSecondaryClock(value);
  }, []);

  // ============================================
  // PERIOD CONTROL
  // ============================================

  const advancePeriod = useCallback(async (): Promise<ValidationResult> => {
    if (!engineRef.current) {
      return { valid: false, error: 'Game engine not initialized' };
    }

    return engineRef.current.advancePeriod();
  }, []);

  // ============================================
  // POSSESSION
  // ============================================

  const togglePossession = useCallback(async () => {
    if (!engineRef.current) return;
    engineRef.current.togglePossession();
  }, []);

  const setPossession = useCallback(async (team: 'A' | 'B') => {
    if (!engineRef.current) return;
    engineRef.current.setPossession(team);
  }, []);

  // ============================================
  // UNDO
  // ============================================

  const undoLastAction = useCallback(async (): Promise<ValidationResult> => {
    if (!engineRef.current) {
      return { valid: false, error: 'Game engine not initialized' };
    }

    return engineRef.current.undoLastAction();
  }, []);

  // ============================================
  // GAME CONTROL
  // ============================================

  const endGame = useCallback(async () => {
    if (!engineRef.current) return;
    engineRef.current.endGame();
  }, []);

  const getWinner = useCallback((): 'A' | 'B' | null => {
    if (!engineRef.current) return null;
    return engineRef.current.getWinner();
  }, []);

  // ============================================
  // RETURN
  // ============================================

  return {
    game,
    config: configRef.current,
    loading,
    error,

    recordScore,
    recordViolation,
    callTimeout,

    toggleGameClock,
    updateGameTime,
    resetSecondaryClock,
    updateSecondaryClock,

    advancePeriod,

    togglePossession,
    setPossession,

    undoLastAction,

    endGame,
    getWinner,
  };
};

// ============================================
// SPECIALIZED HOOKS (for backwards compatibility)
// ============================================

/**
 * Basketball-specific hook (wrapper around useGame)
 * Use this if you need basketball-specific type hints
 */
export const useBasketballGame = (gameCode: string) => {
  return useGame(gameCode);
};

/**
 * Badminton-specific hook
 */
export const useBadmintonGame = (gameCode: string) => {
  return useGame(gameCode);
};

/**
 * Kabaddi-specific hook
 */
export const useKabaddiGame = (gameCode: string) => {
  return useGame(gameCode);
};