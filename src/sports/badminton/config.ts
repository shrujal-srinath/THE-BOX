// src/sports/badminton/config.ts
/**
 * BADMINTON SPORT CONFIGURATION
 * 
 * Rally scoring system - point on every rally
 * Best of 3 sets to 21 points (win by 2, cap at 30)
 */

import type { SportConfig, Game } from '../../core/types';

export const badmintonConfig: SportConfig = {
  // ============================================
  // META
  // ============================================
  meta: {
    id: 'badminton',
    name: 'Badminton',
    icon: '🏸',
    description: 'Racquet sport with shuttlecock',
    color: '#10B981',
    enabled: true,
  },

  // ============================================
  // RULES
  // ============================================
  rules: {
    periodConfig: {
      type: 'set',
      count: 3,
      duration: 0, // Untimed
      label: (n) => `Set ${n}`,
    },

    timing: {
      hasGameClock: false,
      clockDirection: 'up',
      hasSecondaryClock: false,
    },

    scoring: {
      winCondition: 'best-of-sets',
      targetScore: 21,
      setsToWin: 2,
      winByMargin: 2,
      maxScore: 30,
    },

    team: {
      minPlayers: 1,
      maxPlayers: 2,
      allowSubstitutions: false,
      timeoutsPerPeriod: 0,
    },

    overtime: {
      enabled: false, // Deuce system instead
    },
  },

  // ============================================
  // ACTIONS
  // ============================================
  actions: {
    scores: [
      {
        id: 'point',
        label: 'Point',
        shortLabel: '+1',
        value: 1,
        color: '#10B981',
        icon: '🏸',
        playerStats: ['points'],
        teamStats: ['score'],
      },
      {
        id: 'ace',
        label: 'Ace (Service Winner)',
        shortLabel: 'ACE',
        value: 1,
        color: '#3B82F6',
        icon: '⚡',
        playerStats: ['points', 'aces'],
        teamStats: ['score'],
      },
    ],

    violations: [
      {
        id: 'fault',
        label: 'Fault',
        color: '#EF4444',
        penaltyType: 'possession',
        penaltyValue: 1, // Opponent gets point
        playerStats: ['faults'],
      },
      {
        id: 'let',
        label: 'Let (Replay)',
        color: '#F59E0B',
        penaltyType: 'none',
        penaltyValue: 0,
      },
      {
        id: 'misconduct',
        label: 'Misconduct',
        color: '#DC2626',
        penaltyType: 'score',
        penaltyValue: 1,
        playerStats: ['misconducts'],
      },
    ],

    events: [
      {
        id: 'injury',
        label: 'Injury Timeout',
        type: 'injury',
        requiresPlayer: true,
      },
      {
        id: 'challenge',
        label: 'Challenge',
        type: 'challenge',
        requiresPlayer: false,
      },
    ],
  },

  // ============================================
  // STATS
  // ============================================
  playerStats: [
    { id: 'points', label: 'Points', shortLabel: 'PTS', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'aces', label: 'Aces', shortLabel: 'ACE', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'smashes', label: 'Smashes', shortLabel: 'SMH', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'drops', label: 'Drop Shots', shortLabel: 'DRP', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'clears', label: 'Clears', shortLabel: 'CLR', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'faults', label: 'Faults', shortLabel: 'FLT', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'misconducts', label: 'Misconducts', shortLabel: 'MC', defaultValue: 0, type: 'number' },
  ],

  teamStats: [
    { id: 'score', label: 'Score', defaultValue: 0, type: 'number', displayInTable: true },
    { id: 'setsWon', label: 'Sets Won', defaultValue: 0, type: 'number', displayInTable: true },
  ],

  // ============================================
  // DISPLAY
  // ============================================
  display: {
    layout: 'rally',
    primaryMetric: 'score',
    secondaryMetrics: ['setsWon'],
    showClock: false,
    showPossession: true, // Server indicator
    showTimeouts: false,
    showPeriod: true,
    customElements: [
      {
        label: 'Set Score',
        value: (game: Game) => {
          const setsA = game.teams.A.stats.setsWon || 0;
          const setsB = game.teams.B.stats.setsWon || 0;
          return `${setsA}-${setsB}`;
        },
      },
      {
        label: 'Server',
        value: (game: Game) => {
          return game.state.possession === 'A' ? game.teams.A.name : game.teams.B.name;
        },
      },
    ],
  },

  // ============================================
  // VALIDATORS
  // ============================================
  validators: {
    validateAction: (action, game) => {
      const teamScore = game.teams[action.team].score;
      const maxScore = 30;

      if (teamScore >= maxScore) {
        return { valid: false, error: 'Maximum score reached' };
      }

      return { valid: true };
    },

    shouldEndPeriod: (game) => {
      const scoreA = game.teams.A.score;
      const scoreB = game.teams.B.score;
      const targetScore = 21;
      const winByMargin = 2;
      const maxScore = 30;

      // Check if either team hit max score
      if (scoreA === maxScore || scoreB === maxScore) {
        return true;
      }

      // Check normal win condition (21+, win by 2)
      if (scoreA >= targetScore && scoreA - scoreB >= winByMargin) {
        return true;
      }
      if (scoreB >= targetScore && scoreB - scoreA >= winByMargin) {
        return true;
      }

      return false;
    },

    shouldEndGame: (game) => {
      const setsA = game.teams.A.stats.setsWon as number;
      const setsB = game.teams.B.stats.setsWon as number;
      const setsToWin = 2;

      return setsA >= setsToWin || setsB >= setsToWin;
    },

    getWinner: (game) => {
      const setsA = game.teams.A.stats.setsWon as number;
      const setsB = game.teams.B.stats.setsWon as number;

      if (setsA > setsB) return 'A';
      if (setsB > setsA) return 'B';
      return null;
    },
  },
};