// src/sports/kabaddi/config.ts
/**
 * KABADDI SPORT CONFIGURATION
 * 
 * Raid-based contact team sport
 * 2 halves of 20 minutes each
 */

import type { SportConfig, Game } from '../../core/types';

export const kabaddiConfig: SportConfig = {
  // ============================================
  // META
  // ============================================
  meta: {
    id: 'kabaddi',
    name: 'Kabaddi',
    icon: '🤼',
    description: 'Contact team sport with raids',
    color: '#DC2626',
    enabled: true,
  },

  // ============================================
  // RULES
  // ============================================
  rules: {
    periodConfig: {
      type: 'half',
      count: 2,
      duration: 20,
      label: (n) => `Half ${n}`,
    },

    timing: {
      hasGameClock: true,
      clockDirection: 'down',
      hasSecondaryClock: true,
      secondaryClockDuration: 30,
      secondaryClockLabel: 'Raid Timer',
    },

    scoring: {
      winCondition: 'highest-score',
    },

    team: {
      minPlayers: 7,
      maxPlayers: 12,
      allowSubstitutions: true,
      timeoutsPerPeriod: 2,
    },

    overtime: {
      enabled: true,
      duration: 7,
      suddenDeath: false,
    },
  },

  // ============================================
  // ACTIONS
  // ============================================
  actions: {
    scores: [
      {
        id: 'touch_point',
        label: 'Touch Point',
        shortLabel: 'Touch',
        value: 1,
        color: '#3B82F6',
        icon: '👆',
        playerStats: ['points', 'touchPoints'],
        teamStats: ['score'],
      },
      {
        id: 'bonus_point',
        label: 'Bonus Point',
        shortLabel: 'Bonus',
        value: 1,
        color: '#10B981',
        icon: '⭐',
        playerStats: ['points', 'bonusPoints'],
        teamStats: ['score'],
      },
      {
        id: 'all_out',
        label: 'All Out',
        shortLabel: 'All Out',
        value: 2,
        color: '#F59E0B',
        icon: '💥',
        teamStats: ['score', 'allOuts'],
      },
      {
        id: 'super_tackle',
        label: 'Super Tackle',
        shortLabel: 'S.Tackle',
        value: 2,
        color: '#8B5CF6',
        icon: '🛡️',
        playerStats: ['points', 'superTackles'],
        teamStats: ['score'],
      },
    ],

    violations: [
      {
        id: 'out',
        label: 'Out',
        color: '#EF4444',
        penaltyType: 'score',
        penaltyValue: 1,
        playerStats: ['outs'],
      },
      {
        id: 'technical_point',
        label: 'Technical Point',
        color: '#F59E0B',
        penaltyType: 'score',
        penaltyValue: 1,
      },
      {
        id: 'timeout',
        label: 'Timeout',
        color: '#6366F1',
        penaltyType: 'none',
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
      {
        id: 'review',
        label: 'Video Review',
        type: 'challenge',
        requiresPlayer: false,
      },
    ],
  },

  // ============================================
  // STATS
  // ============================================
  playerStats: [
    { id: 'points', label: 'Total Points', shortLabel: 'PTS', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'touchPoints', label: 'Touch Points', shortLabel: 'TP', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'bonusPoints', label: 'Bonus Points', shortLabel: 'BP', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'superTackles', label: 'Super Tackles', shortLabel: 'ST', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'tackles', label: 'Tackles', shortLabel: 'T', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'raids', label: 'Raids', shortLabel: 'R', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'successfulRaids', label: 'Successful Raids', shortLabel: 'SR', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'emptyRaids', label: 'Empty Raids', shortLabel: 'ER', defaultValue: 0, type: 'number' },
    { id: 'outs', label: 'Outs', shortLabel: 'OUT', defaultValue: 0, type: 'number' },
  ],

  teamStats: [
    { id: 'score', label: 'Score', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'allOuts', label: 'All Outs', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'timeouts', label: 'Timeouts Remaining', defaultValue: 2, type: 'number', displayInTable: true },
  ],

  // ============================================
  // DISPLAY
  // ============================================
  display: {
    layout: 'dual-score',
    primaryMetric: 'score',
    secondaryMetrics: ['allOuts', 'timeouts'],
    showClock: true,
    showPossession: true, // Raiding team
    showTimeouts: true,
    showPeriod: true,
    customElements: [
      {
        label: 'Raiding',
        value: (game: Game) => {
          return game.state.possession === 'A' ? game.teams.A.name : game.teams.B.name;
        },
      },
      {
        label: 'All Outs',
        value: (game: Game) => {
          const allOutsA = game.teams.A.stats.allOuts || 0;
          const allOutsB = game.teams.B.stats.allOuts || 0;
          return `${allOutsA}-${allOutsB}`;
        },
      },
    ],
  },

  // ============================================
  // VALIDATORS
  // ============================================
  validators: {
    validateAction: (action, game) => {
      return { valid: true };
    },

    shouldEndPeriod: (game) => {
      const { minutes, seconds, tenths } = game.state.clock.game;
      return minutes === 0 && seconds === 0 && tenths === 0;
    },

    shouldEndGame: (game) => {
      const maxPeriods = 2;
      if (game.state.currentPeriod < maxPeriods) {
        return false;
      }

      const timeExpired = game.state.clock.game.minutes === 0 && 
                          game.state.clock.game.seconds === 0;
      
      if (!timeExpired) {
        return false;
      }

      const winner = game.teams.A.score !== game.teams.B.score;
      return winner;
    },

    getWinner: (game) => {
      if (game.teams.A.score > game.teams.B.score) return 'A';
      if (game.teams.B.score > game.teams.A.score) return 'B';
      return null;
    },

    calculateDerivedStats: (player) => {
      const raidSuccess = player.stats.raids
        ? ((player.stats.successfulRaids as number) / (player.stats.raids as number) * 100).toFixed(1)
        : '0.0';

      return {
        raidSuccessRate: raidSuccess,
      };
    },
  },
};