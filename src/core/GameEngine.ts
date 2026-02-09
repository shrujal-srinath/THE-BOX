// src/core/GameEngine.ts
/**
 * UNIVERSAL GAME ENGINE
 * 
 * This is the brain. It manages game state for ANY sport.
 * Sport-specific logic is injected via SportConfig.
 */

import type {
  Game,
  GameAction,
  GameState,
  SportConfig,
  Team,
  Player,
  TimeValue,
  ActionResult,
  ValidationResult,
} from './types';

export class GameEngine {
  private game: Game;
  private config: SportConfig;
  private listeners: Set<(game: Game) => void> = new Set();

  constructor(game: Game, config: SportConfig) {
    this.game = game;
    this.config = config;
  }

  // ============================================
  // STATE MANAGEMENT
  // ============================================

  getGame(): Game {
    return { ...this.game };
  }

  setState(game: Game): void {
    this.game = game;
    this.notifyListeners();
  }

  subscribe(callback: (game: Game) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    this.listeners.forEach(cb => cb(this.getGame()));
  }

  private update(updates: Partial<Game>): void {
    this.game = {
      ...this.game,
      ...updates,
      lastUpdate: Date.now(),
    };
    this.notifyListeners();
  }

  // ============================================
  // CORE ACTIONS
  // ============================================

  /**
   * Record a score
   */
  recordScore(
    team: 'A' | 'B',
    scoreActionId: string,
    playerId?: string
  ): ValidationResult {
    const scoreAction = this.config.actions.scores.find(s => s.id === scoreActionId);
    
    if (!scoreAction) {
      return { valid: false, error: 'Invalid score action' };
    }

    // Build action object
    const action: GameAction = {
      id: this.generateActionId(),
      timestamp: Date.now(),
      type: 'score',
      team,
      playerId,
      playerName: playerId ? this.getPlayer(team, playerId)?.name : undefined,
      action: scoreActionId,
      value: scoreAction.value,
      period: this.game.state.currentPeriod,
      gameTime: { ...this.game.state.clock.game },
      result: {
        scoreChange: { A: 0, B: 0 },
      },
      undone: false,
    };

    // Validate
    const validation = this.config.validators.validateAction(action, this.game);
    if (!validation.valid) {
      return validation;
    }

    // Apply score
    action.result.scoreChange[team] = scoreAction.value;
    this.applyAction(action);

    return { valid: true };
  }

  /**
   * Record a violation
   */
  recordViolation(
    team: 'A' | 'B',
    violationId: string,
    playerId?: string
  ): ValidationResult {
    const violation = this.config.actions.violations.find(v => v.id === violationId);
    
    if (!violation) {
      return { valid: false, error: 'Invalid violation' };
    }

    const action: GameAction = {
      id: this.generateActionId(),
      timestamp: Date.now(),
      type: 'violation',
      team,
      playerId,
      playerName: playerId ? this.getPlayer(team, playerId)?.name : undefined,
      action: violationId,
      value: violation.penaltyValue || 0,
      period: this.game.state.currentPeriod,
      gameTime: { ...this.game.state.clock.game },
      result: {
        scoreChange: { A: 0, B: 0 },
      },
      undone: false,
    };

    // Handle penalty
    if (violation.penaltyType === 'score' && violation.penaltyValue) {
      // Opponent gets points
      const opponent = team === 'A' ? 'B' : 'A';
      action.result.scoreChange[opponent] = violation.penaltyValue;
    }

    if (violation.penaltyType === 'possession') {
      action.result.possessionChange = true;
    }

    this.applyAction(action);

    return { valid: true };
  }

  /**
   * Call a timeout
   */
  callTimeout(team: 'A' | 'B'): ValidationResult {
    const teamObj = this.game.teams[team];
    
    if (teamObj.timeoutsUsed >= teamObj.timeouts) {
      return { valid: false, error: 'No timeouts remaining' };
    }

    const action: GameAction = {
      id: this.generateActionId(),
      timestamp: Date.now(),
      type: 'timeout',
      team,
      action: 'timeout',
      value: -1,
      period: this.game.state.currentPeriod,
      gameTime: { ...this.game.state.clock.game },
      result: {
        scoreChange: { A: 0, B: 0 },
        clockStop: true,
      },
      undone: false,
    };

    this.applyAction(action);

    // Update timeout count
    teamObj.timeoutsUsed++;
    this.update({ teams: this.game.teams });

    return { valid: true };
  }

  /**
   * Apply an action to game state
   */
  private applyAction(action: GameAction): void {
    // Update scores
    if (action.result.scoreChange.A !== 0 || action.result.scoreChange.B !== 0) {
      this.game.teams.A.score += action.result.scoreChange.A;
      this.game.teams.B.score += action.result.scoreChange.B;
      this.game.teams.A.stats.score = this.game.teams.A.score;
      this.game.teams.B.stats.score = this.game.teams.B.score;
    }

    // Update player stats
    if (action.playerId) {
      const player = this.getPlayer(action.team, action.playerId);
      if (player) {
        player.stats.points += action.value;
        
        // Update sport-specific stats
        const scoreAction = this.config.actions.scores.find(s => s.id === action.action);
        if (scoreAction?.playerStats) {
          scoreAction.playerStats.forEach(statId => {
            if (statId in player.stats) {
              (player.stats as any)[statId] += 1;
            }
          });
        }
      }
    }

    // Change possession
    if (action.result.possessionChange) {
      this.game.state.possession = action.team === 'A' ? 'B' : 'A';
    }

    // Stop clock
    if (action.result.clockStop) {
      this.game.state.clock.gameRunning = false;
      this.game.state.clock.secondaryRunning = false;
    }

    // Add to action log
    this.game.actionLog.push(action);

    // Notify
    this.update({
      teams: this.game.teams,
      state: this.game.state,
      actionLog: this.game.actionLog,
    });
  }

  // ============================================
  // CLOCK MANAGEMENT
  // ============================================

  /**
   * Toggle game clock
   */
  toggleGameClock(): void {
    if (!this.config.rules.timing.hasGameClock) {
      throw new Error(`${this.config.meta.name} does not use a game clock`);
    }

    this.game.state.clock.gameRunning = !this.game.state.clock.gameRunning;
    
    // Also toggle secondary clock if present
    if (this.config.rules.timing.hasSecondaryClock) {
      this.game.state.clock.secondaryRunning = this.game.state.clock.gameRunning;
    }

    this.update({ state: this.game.state });
  }

  /**
   * Update game time (called by timer)
   */
  updateGameTime(time: TimeValue): void {
    this.game.state.clock.game = time;
    this.update({ state: this.game.state });

    // Check if period should end
    if (this.config.validators.shouldEndPeriod(this.game)) {
      this.endPeriod();
    }
  }

  /**
   * Reset secondary clock
   */
  resetSecondaryClock(value?: number): void {
    if (!this.config.rules.timing.hasSecondaryClock) {
      throw new Error('Sport does not have secondary clock');
    }

    const resetValue = value || this.config.rules.timing.secondaryClockDuration || 0;
    this.game.state.clock.secondary = resetValue;
    this.update({ state: this.game.state });
  }

  /**
   * Update secondary clock
   */
  updateSecondaryClock(value: number): void {
    this.game.state.clock.secondary = value;
    this.update({ state: this.game.state });
  }

  // ============================================
  // PERIOD MANAGEMENT
  // ============================================

  /**
   * Advance to next period
   */
  advancePeriod(): ValidationResult {
    const maxPeriods = this.config.rules.periodConfig.count;
    
    if (this.game.state.currentPeriod >= maxPeriods) {
      // Check if overtime is enabled
      if (this.config.rules.overtime.enabled) {
        return this.startOvertime();
      }
      return { valid: false, error: 'Game is complete' };
    }

    this.game.state.currentPeriod++;
    
    // Reset clock for new period
    this.game.state.clock.game = {
      minutes: this.config.rules.periodConfig.duration,
      seconds: 0,
      tenths: 0,
    };
    
    if (this.config.rules.timing.hasSecondaryClock) {
      this.game.state.clock.secondary = this.config.rules.timing.secondaryClockDuration || 0;
    }

    // Reset period-specific stats (e.g., fouls per quarter)
    this.resetPeriodStats();

    this.update({ state: this.game.state });

    return { valid: true };
  }

  private endPeriod(): void {
    this.game.state.clock.gameRunning = false;
    this.game.state.clock.secondaryRunning = false;

    // Record period end action
    const action: GameAction = {
      id: this.generateActionId(),
      timestamp: Date.now(),
      type: 'period_end',
      team: 'A', // Neutral
      action: 'period_end',
      value: 0,
      period: this.game.state.currentPeriod,
      gameTime: { ...this.game.state.clock.game },
      result: { scoreChange: { A: 0, B: 0 } },
      undone: false,
    };

    this.game.actionLog.push(action);
    this.update({ actionLog: this.game.actionLog, state: this.game.state });
  }

  private startOvertime(): ValidationResult {
    if (!this.config.rules.overtime.enabled) {
      return { valid: false, error: 'Overtime not enabled' };
    }

    this.game.state.currentPeriod++;
    this.game.state.clock.game = {
      minutes: this.config.rules.overtime.duration || 5,
      seconds: 0,
      tenths: 0,
    };

    this.update({ state: this.game.state });

    return { valid: true };
  }

  private resetPeriodStats(): void {
    // Sport-specific period stat resets (e.g., basketball fouls per quarter)
    // This can be extended per sport
  }

  // ============================================
  // POSSESSION
  // ============================================

  togglePossession(): void {
    if (this.game.state.possession === null) {
      throw new Error('Sport does not track possession');
    }

    this.game.state.possession = this.game.state.possession === 'A' ? 'B' : 'A';
    this.update({ state: this.game.state });
  }

  setPossession(team: 'A' | 'B'): void {
    this.game.state.possession = team;
    this.update({ state: this.game.state });
  }

  // ============================================
  // UNDO/REDO
  // ============================================

  /**
   * Undo last action
   */
  undoLastAction(): ValidationResult {
    const lastAction = this.game.actionLog
      .slice()
      .reverse()
      .find(a => !a.undone);

    if (!lastAction) {
      return { valid: false, error: 'No actions to undo' };
    }

    // Reverse the action
    if (lastAction.result.scoreChange.A !== 0 || lastAction.result.scoreChange.B !== 0) {
      this.game.teams.A.score -= lastAction.result.scoreChange.A;
      this.game.teams.B.score -= lastAction.result.scoreChange.B;
      this.game.teams.A.stats.score = this.game.teams.A.score;
      this.game.teams.B.stats.score = this.game.teams.B.score;
    }

    // Mark as undone
    lastAction.undone = true;

    this.update({
      teams: this.game.teams,
      actionLog: this.game.actionLog,
    });

    return { valid: true };
  }

  // ============================================
  // GAME CONTROL
  // ============================================

  /**
   * End the game
   */
  endGame(): void {
    this.game.status = 'completed';
    this.game.state.clock.gameRunning = false;
    this.game.state.clock.secondaryRunning = false;
    this.update({ status: this.game.status, state: this.game.state });
  }

  /**
   * Get current winner
   */
  getWinner(): 'A' | 'B' | null {
    return this.config.validators.getWinner(this.game);
  }

  // ============================================
  // HELPERS
  // ============================================

  private getPlayer(team: 'A' | 'B', playerId: string): Player | undefined {
    return this.game.teams[team].players.find(p => p.id === playerId);
  }

  private generateActionId(): string {
    return `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}