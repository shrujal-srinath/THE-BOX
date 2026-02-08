// src/core/types/index.ts
//

export type SportType = 'basketball' | 'badminton' | 'kabaddi' | 'volleyball';

export interface SportMeta {
  id: SportType;
  name: string;
  icon: string;
  color: string;
  enabled: boolean;
}

// --- GAME STATE ---
export interface Game {
  id: string;
  code: string;
  sport: SportType;
  status: 'setup' | 'live' | 'completed';
  createdAt: number;
  lastUpdate: number;
  
  // Teams (Generic)
  teams: {
    A: Team;
    B: Team;
  };

  // State (Generic)
  state: {
    currentPeriod: number;
    clock: {
      game: { minutes: number; seconds: number; tenths: number };
      gameRunning: boolean;
      secondary: number | null; // Shot clock
      secondaryRunning: boolean;
    };
    possession: 'A' | 'B' | null;
    custom: Record<string, any>; // Sport-specific data
  };

  actionLog: GameAction[];
}

export interface Team {
  name: string;
  color: string;
  score: number;
  timeouts: number;
  timeoutsUsed: number;
  stats: Record<string, any>; // Flexible stats
  players: Player[];
}

export interface Player {
  id: string;
  name: string;
  number: string;
  stats: Record<string, any>;
  disqualified: boolean;
}

export interface GameAction {
  id: string;
  type: 'score' | 'violation' | 'timeout' | 'period_end' | 'undo';
  team: 'A' | 'B';
  actionId: string; // Links to config
  value: number;
  timestamp: number;
  undone: boolean;
}

// --- SPORT CONFIGURATION ---
export interface SportConfig {
  meta: SportMeta;
  
  rules: {
    periodConfig: {
      count: number;
      duration: number;
      type: 'quarter' | 'set' | 'half';
      label: (n: number) => string;
    };
    timing: {
      hasGameClock: boolean;
      clockDirection: 'up' | 'down';
      hasSecondaryClock: boolean;
      secondaryClockDuration?: number;
    };
  };

  actions: {
    scores: ScoreAction[];
    violations: ViolationAction[];
  };
  
  // Derived Logic
  validators: {
    shouldEndPeriod: (game: Game) => boolean;
    getWinner: (game: Game) => 'A' | 'B' | null;
  };
}

export interface ScoreAction {
  id: string;
  label: string;
  value: number;
  color: string;
  icon?: string;
  playerStats?: string[]; // Which stats to increment
}

export interface ViolationAction {
  id: string;
  label: string;
  color: string;
  penaltyType: 'score' | 'possession' | 'none';
  penaltyValue?: number;
}