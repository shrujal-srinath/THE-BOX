// src/hooks/useGame.ts
import { useState, useEffect } from 'react';
import { subscribeToGame, updateGame } from '../services/gameService';
import { getSportConfig } from '../services/sportLoader';
import { GameEngine } from '../core/GameEngine';
import type { Game, SportConfig } from '../core/types';

export const useGame = (gameCode: string) => {
  const [game, setGame] = useState<Game | null>(null);
  const [config, setConfig] = useState<SportConfig | null>(null);
  const [engine, setEngine] = useState<GameEngine | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameCode) return;

    const unsubscribe = subscribeToGame(gameCode, (gameData) => {
      if (gameData) {
        setGame(gameData);
        const sportConfig = getSportConfig(gameData.sport);
        setConfig(sportConfig);
        setEngine(new GameEngine(gameData, sportConfig));
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [gameCode]);

  const recordScore = (team: 'A' | 'B', scoreActionId: string) => {
    if (!engine || !game) return;
    engine.recordScore(team, scoreActionId);
    updateGame(gameCode, { ...game, lastUpdate: Date.now() });
  };

  const toggleGameClock = () => {
    if (!engine || !game) return;
    engine.toggleGameClock();
    updateGame(gameCode, { ...game, lastUpdate: Date.now() });
  };

  const undoLastAction = () => {
    if (!engine || !game) return;
    engine.undoLastAction();
    updateGame(gameCode, { ...game, lastUpdate: Date.now() });
  };

  const togglePossession = () => {
    if (!engine || !game) return;
    const newPossession = game.state.possession === 'A' ? 'B' : 'A';
    game.state.possession = newPossession;
    updateGame(gameCode, { ...game, lastUpdate: Date.now() });
  };

  return {
    game,
    config,
    loading,
    recordScore,
    toggleGameClock,
    undoLastAction,
    togglePossession,
  };
};

export const useAuth = () => {
  return {
    currentUser: { uid: 'demo-user', displayName: 'Demo User' },
    loading: false,
  };
};