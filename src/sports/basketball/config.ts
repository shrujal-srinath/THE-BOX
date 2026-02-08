// src/sports/basketball/config.ts
import type { SportConfig } from '../../core/types';

export const basketballConfig: SportConfig = {
  meta: {
    id: 'basketball',
    name: 'Basketball',
    icon: '🏀',
    color: '#F97316',
    enabled: true
  },
  rules: {
    periodConfig: { count: 4, duration: 10, type: 'quarter', label: (n) => `Q${n}` },
    timing: { hasGameClock: true, clockDirection: 'down', hasSecondaryClock: true, secondaryClockDuration: 24 }
  },
  actions: {
    scores: [
      { id: '1pt', label: 'FT', value: 1, color: '#FFFFFF', icon: '1' },
      { id: '2pt', label: 'FG', value: 2, color: '#3B82F6', icon: '2' },
      { id: '3pt', label: '3PT', value: 3, color: '#10B981', icon: '3' }
    ],
    violations: [
      { id: 'foul', label: 'Foul', color: '#EF4444', penaltyType: 'score', penaltyValue: 0 }
    ]
  },
  validators: {
    shouldEndPeriod: (g) => g.state.clock.game.minutes === 0 && g.state.clock.game.seconds === 0,
    getWinner: (g) => g.teams.A.score > g.teams.B.score ? 'A' : 'B'
  }
};