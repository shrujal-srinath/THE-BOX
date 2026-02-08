// src/sports/badminton/config.ts
import type { SportConfig } from '../../core/types';

export const badmintonConfig: SportConfig = {
  meta: {
    id: 'badminton',
    name: 'Badminton',
    icon: '🏸',
    color: '#10B981',
    enabled: true
  },
  rules: {
    periodConfig: { count: 3, duration: 0, type: 'set', label: (n) => `Set ${n}` },
    timing: { hasGameClock: false, clockDirection: 'up', hasSecondaryClock: false }
  },
  actions: {
    scores: [
      { id: 'point', label: 'Point', value: 1, color: '#10B981', icon: '🏸' },
      { id: 'ace', label: 'Ace', value: 1, color: '#F59E0B', icon: '⚡' }
    ],
    violations: []
  },
  validators: {
    shouldEndPeriod: (g) => (g.teams.A.score >= 21 || g.teams.B.score >= 21),
    getWinner: (g) => null
  }
};