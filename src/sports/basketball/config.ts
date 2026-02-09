// src/sports/basketball/config.ts
/**
 * BASKETBALL SPORT CONFIGURATION
 * 
 * Defines all basketball-specific rules, actions, and validation logic.
 * This is a "plugin" for the generic game engine.
 */

import type { SportConfig, Game } from '../../core/types';

export const basketballConfig: SportConfig = {
  // ============================================
  // META
  // ============================================
  meta: {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    description: '5v5 court sport with hoops',
    color: '#F97316',
    enabled: true,
  },

  // ============================================
  // RULES
  // ============================================
  rules: {
    periodConfig: {
      type: 'quarter',
      count: 4,
      duration: 10,
      label: (n) => n <= 4 ? `Q${n}` : `OT${n - 4}`,
    },

    timing: {
      hasGameClock: true,
      clockDirection: 'down',
      hasSecondaryClock: true,
      secondaryClockDuration: 24,
      secondaryClockLabel: 'Shot Clock',
    },

    scoring: {
      winCondition: 'highest-score',
    },

    team: {
      minPlayers: 5,
      maxPlayers: 15,
      allowSubstitutions: true,
      timeoutsPerPeriod: 2,
      maxFouls: 5, // Player fouls out
    },

    overtime: {
      enabled: true,
      duration: 5,
      suddenDeath: false,
    },
  },

  // ============================================
  // ACTIONS
  // ============================================
  actions: {
    scores: [
      {
        id: 'free_throw',
        label: 'Free Throw',
        shortLabel: '+1',
        value: 1,
        color: '#FFFFFF',
        icon: '1️⃣',
        playerStats: ['points', 'freeThrowsMade'],
        teamStats: ['score'],
      },
      {
        id: 'two_pointer',
        label: '2-Point Field Goal',
        shortLabel: '+2',
        value: 2,
        color: '#3B82F6',
        icon: '2️⃣',
        playerStats: ['points', 'fieldGoalsMade'],
        teamStats: ['score'],
      },
      {
        id: 'three_pointer',
        label: '3-Point Field Goal',
        shortLabel: '+3',
        value: 3,
        color: '#10B981',
        icon: '3️⃣',
        playerStats: ['points', 'threePointsMade', 'fieldGoalsMade'],
        teamStats: ['score'],
      },
    ],

    violations: [
      {
        id: 'personal_foul',
        label: 'Personal Foul',
        color: '#EAB308',
        penaltyType: 'score',
        penaltyValue: 1,
        playerStats: ['fouls'],
        teamStats: ['teamFouls', 'foulsThisQuarter'],
      },
      {
        id: 'technical_foul',
        label: 'Technical Foul',
        color: '#EF4444',
        penaltyType: 'score',
        penaltyValue: 1,
        playerStats: ['fouls'],
        teamStats: ['teamFouls'],
      },
      {
        id: 'flagrant_foul',
        label: 'Flagrant Foul',
        color: '#DC2626',
        penaltyType: 'disqualify',
        penaltyValue: 2,
        playerStats: ['fouls'],
        teamStats: ['teamFouls'],
      },
      {
        id: 'timeout',
        label: 'Timeout',
        color: '#6366F1',
        penaltyType: 'none',
        teamStats: [],
      },
    ],

    events: [
      {
        id: 'substitution',
        label: 'Substitution',
        type: 'substitution',
        requiresPlayer: true,
      },
      {
        id: 'injury',
        label: 'Injury Timeout',
        type: 'injury',
        requiresPlayer: true,
      },
    ],
  },

  // ============================================
  // STATS
  // ============================================
  playerStats: [
    { id: 'points', label: 'Points', shortLabel: 'PTS', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'rebounds', label: 'Rebounds', shortLabel: 'REB', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'assists', label: 'Assists', shortLabel: 'AST', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'steals', label: 'Steals', shortLabel: 'STL', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'blocks', label: 'Blocks', shortLabel: 'BLK', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'turnovers', label: 'Turnovers', shortLabel: 'TO', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'fouls', label: 'Fouls', shortLabel: 'PF', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'fieldGoalsMade', label: 'Field Goals Made', shortLabel: 'FGM', defaultValue: 0, type: 'number' },
    { id: 'fieldGoalsAttempted', label: 'Field Goals Attempted', shortLabel: 'FGA', defaultValue: 0, type: 'number' },
    { id: 'threePointsMade', label: '3-Pointers Made', shortLabel: '3PM', defaultValue: 0, type: 'number' },
    { id: 'threePointsAttempted', label: '3-Pointers Attempted', shortLabel: '3PA', defaultValue: 0, type: 'number' },
    { id: 'freeThrowsMade', label: 'Free Throws Made', shortLabel: 'FTM', defaultValue: 0, type: 'number' },
    { id: 'freeThrowsAttempted', label: 'Free Throws Attempted', shortLabel: 'FTA', defaultValue: 0, type: 'number' },
  ],

  teamStats: [
    { id: 'score', label: 'Score', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'teamFouls', label: 'Team Fouls', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'foulsThisQuarter', label: 'Fouls This Quarter', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'timeouts', label: 'Timeouts Remaining', defaultValue: 2, type: 'number', displayInTable: true },
  ],

  // ============================================
  // DISPLAY
  // ============================================
  display: {
    layout: 'dual-score',
    primaryMetric: 'score',
    secondaryMetrics: ['teamFouls', 'timeouts'],
    showClock: true,
    showPossession: true,
    showTimeouts: true,
    showPeriod: true,
    customElements: [
      {
        label: 'Bonus',
        value: (game: Game) => {
          const fouls = game.teams.A.stats.foulsThisQuarter as number;
          return fouls >= 5 ? 'BONUS' : '';
        },
      },
    ],
  },

  // ============================================
  // VALIDATORS
  // ============================================
  validators: {
    validateAction: (action, game) => {
      // Check if player is disqualified
      if (action.playerId) {
        const player = game.teams[action.team].players.find(p => p.id === action.playerId);
        if (player?.disqualified) {
          return { valid: false, error: 'Player is disqualified' };
        }

        // Check if player has fouled out
        if (player && (player.stats.fouls as number) >= 5) {
          return { valid: false, error: 'Player has fouled out' };
        }
      }

      return { valid: true };
    },

    shouldEndPeriod: (game) => {
      const { minutes, seconds, tenths } = game.state.clock.game;
      return minutes === 0 && seconds === 0 && tenths === 0;
    },

    shouldEndGame: (game) => {
      const maxPeriods = 4;
      if (game.state.currentPeriod < maxPeriods) {
        return false;
      }

      // Check if time expired
      const timeExpired = game.state.clock.game.minutes === 0 && 
                          game.state.clock.game.seconds === 0;
      
      if (!timeExpired) {
        return false;
      }

      // Check if there's a winner
      const winner = game.teams.A.score !== game.teams.B.score;
      return winner;
    },

    getWinner: (game) => {
      if (game.teams.A.score > game.teams.B.score) return 'A';
      if (game.teams.B.score > game.teams.A.score) return 'B';
      return null;
    },

    calculateDerivedStats: (player) => {
      const fgPct = player.stats.fieldGoalsAttempted 
        ? ((player.stats.fieldGoalsMade as number) / (player.stats.fieldGoalsAttempted as number) * 100).toFixed(1)
        : '0.0';
      
      const threePct = player.stats.threePointsAttempted
        ? ((player.stats.threePointsMade as number) / (player.stats.threePointsAttempted as number) * 100).toFixed(1)
        : '0.0';
      
      const ftPct = player.stats.freeThrowsAttempted
        ? ((player.stats.freeThrowsMade as number) / (player.stats.freeThrowsAttempted as number) * 100).toFixed(1)
        : '0.0';

      return {
        fgPercentage: fgPct,
        threePercentage: threePct,
        ftPercentage: ftPct,
      };
    },
  },
};