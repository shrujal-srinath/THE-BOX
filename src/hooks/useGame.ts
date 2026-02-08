// src/hooks/useGame.ts
import { useState, useEffect, useRef } from 'react';
import { subscribeToGame, updateGame } from '../services/gameService'; 
import { GameEngine } from '../core/GameEngine';
import { getSportConfig } from '../services/sportLoader';
import type { Game } from '../core/types';

export const useGame = (gameCode: string) => {
  const [game, setGame] = useState<Game | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  useEffect(() => {
    if (!gameCode) return;
    
    // 1. Subscribe to Firebase
    const unsub = subscribeToGame(gameCode, (data) => {
      if (!data) return;
      
      // 2. Initialize Engine on first load
      if (!engineRef.current) {
         // Convert legacy "sport" string to SportType if needed
         const config = getSportConfig(data.sport as any);
         engineRef.current = new GameEngine(data as Game, config);
         
         // 3. When Engine changes, save to Firebase
         engineRef.current.subscribe((updated) => {
            updateGame(gameCode, updated);
            setGame(updated); // Update local state immediately for smooth UI
         });
         
         setGame(data as Game);
      } else {
         // 4. External update (someone else changed the score)
         // Only update if timestamp is newer to avoid loop
         if (data.lastUpdate > (engineRef.current.getGame().lastUpdate || 0)) {
             // Sync engine state
             // Note: In a real realtime app, this needs careful merge logic
             setGame(data as Game);
         }
      }
    });

    return () => {
        unsub();
        engineRef.current?.destroy();
        engineRef.current = null;
    };
  }, [gameCode]);

  // Expose Actions safely
  return {
    game,
    config: game ? getSportConfig(game.sport) : null,
    loading: !game,
    
    recordScore: (t: 'A'|'B', id: string) => engineRef.current?.recordScore(t, id),
    undoLastAction: () => engineRef.current?.undoLastAction(),
    toggleClock: () => engineRef.current?.toggleClock(),
    togglePossession: () => engineRef.current?.togglePossession(),
  };
};