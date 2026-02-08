// src/core/types/index.ts
/**
 * CORE TYPE SYSTEM - SPORT AGNOSTIC
 * 
 * This is the foundation. Every type here works for ANY sport.
 * Basketball, Badminton, Kabaddi all build on top of these.
 */

// ============================================
// SPORT IDENTIFICATION
// ============================================

export type SportType = 'basketball' | 'badminton' | 'kabaddi';

export interface SportMeta {
  id: SportType;
  name: string;
  icon: string;
  description: string;
  color: string; // Primary brand color
  enabled: boolean; // Can disable sports
}

// ============================================
// GAME STRUCTURE
// ============================================

export interface Game {
  // Identity
  id: string;
  code: string; // 6-digit game code
  sport: SportType;
  
  // Ownership
  hostId: string;
  hostName?: string;
  
  // Status
  status: 'setup' | 'live' | 'paused' | 'completed' | 'cancelled';
  createdAt: number;
  lastUpdate: number;
  
  // Settings
  settings: GameSettings;
  
  // Current State
  state: GameState;
  
  // Teams
  teams: {
    A: Team;
    B: Team;
  };
  
  // History (for undo/replay)
  actionLog: GameAction[];
  
  // Metadata
  metadata: GameMetadata;
}

// ============================================
// GAME SETTINGS (Sport-specific)
// ============================================

export interface GameSettings {
  gameName: string;
  venue?: string;
  date?: number;
  
  // Sport-specific rules (configured per sport)
  rules: SportRules;
  
  // Feature flags
  trackPlayerStats: boolean;
  allowSpectators: boolean;
  enableLiveStream: boolean;
}

export interface SportRules {
  // Period configuration
  periodConfig: {
    type: 'quarter' | 'half' | 'set' | 'period' | 'inning';
    count: number; // Total periods in game
    duration: number; // Minutes (0 for untimed)
    label: (n: number) => string; // Format function
  };
  
  // Timing rules
  timing: {
    hasGameClock: boolean;
    clockDirection: 'up' | 'down';
    hasSecondaryClock: boolean;
    secondaryClockDuration?: number;
    secondaryClockLabel?: string;
  };
  
  // Scoring rules
  scoring: {
    winCondition: 'highest-score' | 'reach-target' | 'best-of-sets';
    targetScore?: number;
    setsToWin?: number;
    winByMargin?: number;
    maxScore?: number;
  };
  
  // Team rules
  team: {
    minPlayers: number;
    maxPlayers: number;
    allowSubstitutions: boolean;
    timeoutsPerPeriod?: number;
    maxFouls?: number;
  };
  
  // Overtime rules
  overtime: {
    enabled: boolean;
    duration?: number;
    suddenDeath?: boolean;
  };
}

// ============================================
// GAME STATE (Real-time data)
// ============================================

export interface GameState {
  // Current period
  currentPeriod: number;
  
  // Timing
  clock: ClockState;
  
  // Control
  isRunning: boolean;
  possession: 'A' | 'B' | null;
  
  // Sport-specific state (extensible)
  custom: Record<string, any>;
}

export interface ClockState {
  // Primary clock
  game: TimeValue;
  gameRunning: boolean;
  
  // Secondary clock (optional)
  secondary: number | null;
  secondaryRunning: boolean;
}

export interface TimeValue {
  minutes: number;
  seconds: number;
  tenths: number;
}

// ============================================
// TEAMS & PLAYERS
// ============================================

export interface Team {
  // Identity
  id: 'A' | 'B';
  name: string;
  color: string;
  logo?: string;
  
  // Current score
  score: number;
  
  // Sport-specific metrics (extensible)
  stats: TeamStats;
  
  // Roster
  players: Player[];
  
  // Tactical
  timeouts: number;
  timeoutsUsed: number;
  
  // Custom data per sport
  custom: Record<string, any>;
}

export interface TeamStats {
  // Universal stats
  score: number;
  
  // Sport-specific (stored as key-value)
  [key: string]: number | boolean | string;
}

export interface Player {
  id: string;
  number: string;
  name: string;
  position?: string;
  
  // Active status
  isActive: boolean;
  isStarter: boolean;
  
  // Stats (sport-specific)
  stats: PlayerStats;
  
  // Status flags
  disqualified: boolean;
  injured: boolean;
}

export interface PlayerStats {
  // Common stats
  points: number;
  
  // Sport-specific stats (extensible)
  [key: string]: number | boolean;
}

// ============================================
// ACTIONS & EVENTS
// ============================================

export interface GameAction {
  id: string;
  timestamp: number;
  type: ActionType;
  
  // Who performed it
  team: 'A' | 'B';
  playerId?: string;
  playerName?: string;
  
  // What happened
  action: string; // e.g., '2pt', 'ace', 'tackle'
  value: number; // Score change
  
  // Context
  period: number;
  gameTime: TimeValue;
  
  // Result
  result: ActionResult;
  
  // Metadata
  notes?: string;
  undone: boolean;
}

export type ActionType = 
  | 'score' 
  | 'violation' 
  | 'timeout' 
  | 'substitution' 
  | 'period_end'
  | 'custom';

export interface ActionResult {
  scoreChange: { A: number; B: number };
  statChanges?: Record<string, any>;
  possessionChange?: boolean;
  clockStop?: boolean;
}

// ============================================
// SPORT CONFIGURATION (The Plugin System)
// ============================================

export interface SportConfig {
  meta: SportMeta;
  rules: SportRules;
  
  // Available actions in this sport
  actions: {
    scores: ScoreAction[];
    violations: ViolationAction[];
    events: CustomEvent[];
  };
  
  // Player stat definitions
  playerStats: StatDefinition[];
  teamStats: StatDefinition[];
  
  // Display configuration
  display: DisplayConfig;
  
  // Validation & Logic
  validators: SportValidators;
  
  // UI Components (optional - for sport-specific rendering)
  components?: {
    scoreboard?: string; // Component name
    controlPanel?: string;
    statsView?: string;
  };
}

export interface ScoreAction {
  id: string;
  label: string;
  shortLabel?: string;
  value: number;
  color: string;
  icon?: string;
  
  // Which stats to update
  playerStats?: string[]; // e.g., ['points', 'fieldGoalsMade']
  teamStats?: string[];
}

export interface ViolationAction {
  id: string;
  label: string;
  color: string;
  
  penaltyType: 'score' | 'possession' | 'timeout' | 'disqualify' | 'none';
  penaltyValue?: number;
  
  // Stats to update
  playerStats?: string[];
  teamStats?: string[];
}

export interface CustomEvent {
  id: string;
  label: string;
  type: 'substitution' | 'injury' | 'challenge' | 'other';
  requiresPlayer?: boolean;
}

export interface StatDefinition {
  id: string;
  label: string;
  shortLabel?: string;
  defaultValue: number | boolean | string;
  type: 'number' | 'boolean' | 'string';
  
  // Display options
  displayInTable?: boolean;
  formatValue?: (val: any) => string;
}

export interface DisplayConfig {
  layout: 'dual-score' | 'rally' | 'innings' | 'custom';
  
  // What to show prominently
  primaryMetric: string; // Usually 'score'
  secondaryMetrics?: string[];
  
  // UI flags
  showClock: boolean;
  showPossession: boolean;
  showTimeouts: boolean;
  showPeriod: boolean;
  
  // Custom display elements
  customElements?: {
    label: string;
    value: (game: Game) => string | number;
  }[];
}

export interface SportValidators {
  // Validate if action is legal in current state
  validateAction: (action: GameAction, game: Game) => ValidationResult;
  
  // Check if period should end
  shouldEndPeriod: (game: Game) => boolean;
  
  // Check if game should end
  shouldEndGame: (game: Game) => boolean;
  
  // Determine winner
  getWinner: (game: Game) => 'A' | 'B' | null;
  
  // Calculate derived stats
  calculateDerivedStats?: (player: Player) => Record<string, any>;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  warning?: string;
}

// ============================================
// METADATA
// ============================================

export interface GameMetadata {
  tournament?: {
    id: string;
    name: string;
    round?: string;
  };
  
  officials?: {
    referee?: string;
    scorer?: string;
    timer?: string;
  };
  
  tags?: string[];
  notes?: string;
  
  // Analytics
  viewerCount?: number;
  peakViewers?: number;
}

// ============================================
// HELPERS
// ============================================

export const createEmptyTime = (): TimeValue => ({
  minutes: 0,
  seconds: 0,
  tenths: 0,
});

export const createEmptyTeam = (id: 'A' | 'B', name: string, color: string): Team => ({
  id,
  name,
  color,
  score: 0,
  stats: { score: 0 },
  players: [],
  timeouts: 0,
  timeoutsUsed: 0,
  custom: {},
});

export const createEmptyPlayer = (id: string): Player => ({
  id,
  number: '',
  name: '',
  isActive: false,
  isStarter: false,
  stats: { points: 0 },
  disqualified: false,
  injured: false,
});