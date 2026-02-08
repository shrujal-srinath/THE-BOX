// src/core/GameEngine.ts
//

import type { Game, GameAction, SportConfig, Team } from './types';

export class GameEngine {
  private game: Game;
  private config: SportConfig;
  private listeners: Set<(game: Game) => void> = new Set();

  constructor(game: Game, config: SportConfig) {
    this.game = game;
    this.config = config;
  }

  getGame(): Game { return { ...this.game }; }

  subscribe(cb: (g: Game) => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.game.lastUpdate = Date.now();
    this.listeners.forEach(cb => cb(this.getGame()));
  }

  // --- CORE ACTIONS ---

  recordScore(team: 'A' | 'B', actionId: string) {
    const actionDef = this.config.actions.scores.find(s => s.id === actionId);
    if (!actionDef) return;

    // Create Action Log
    const action: GameAction = {
      id: Date.now().toString(),
      type: 'score',
      team,
      actionId,
      value: actionDef.value,
      timestamp: Date.now(),
      undone: false
    };

    // Apply State
    this.game.teams[team].score += actionDef.value;
    this.game.actionLog.push(action);
    this.notify();
  }

  undoLastAction() {
    const lastAction = this.game.actionLog.slice().reverse().find(a => !a.undone);
    if (!lastAction) return;

    // Revert State
    if (lastAction.type === 'score') {
       this.game.teams[lastAction.team].score -= lastAction.value;
    }
    
    lastAction.undone = true;
    this.notify();
  }

  // --- CLOCK & PERIODS ---

  toggleClock() {
    this.game.state.clock.gameRunning = !this.game.state.clock.gameRunning;
    this.notify();
  }

  updateTime(minutes: number, seconds: number) {
    this.game.state.clock.game = { ...this.game.state.clock.game, minutes, seconds };
    
    // Check auto-end period
    if (this.config.validators.shouldEndPeriod(this.game)) {
        this.game.state.clock.gameRunning = false;
    }
    this.notify();
  }

  togglePossession() {
    const current = this.game.state.possession;
    this.game.state.possession = current === 'A' ? 'B' : 'A';
    this.notify();
  }
}