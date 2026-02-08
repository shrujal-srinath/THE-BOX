// src/services/gameService.ts
import { doc, setDoc, updateDoc, onSnapshot, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { Game, SportType } from '../core/types';
import { getSportConfig } from './sportLoader';

// --- FACTORY: CREATES THE CORRECT GAME STATE ---
const createInitialState = (sport: SportType, settings: any) => {
    const config = getSportConfig(sport);
    
    return {
        currentPeriod: 1,
        clock: {
            game: { minutes: config.rules.periodConfig.duration, seconds: 0, tenths: 0 },
            gameRunning: false,
            secondary: config.rules.timing.hasSecondaryClock ? config.rules.timing.secondaryClockDuration || 24 : null,
            secondaryRunning: false
        },
        possession: 'A',
        custom: {} // Sport specific flags go here
    };
};

export const initializeNewGame = async (
    settings: any,
    teamA: { name: string; color: string },
    teamB: { name: string; color: string },
    sport: SportType,
    hostId: string
): Promise<string> => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // 1. Get Default Logic for this Sport
    const state = createInitialState(sport, settings);

    // 2. Build the Game Object
    const newGame: Game = {
        id: code,
        code,
        sport,
        hostId,
        status: 'setup',
        createdAt: Date.now(),
        lastUpdate: Date.now(),
        teams: {
            A: { ...teamA, score: 0, timeouts: 2, timeoutsUsed: 0, stats: {}, players: [] },
            B: { ...teamB, score: 0, timeouts: 2, timeoutsUsed: 0, stats: {}, players: [] }
        },
        state: state as any,
        actionLog: []
    };

    // 3. Save to Firebase
    await setDoc(doc(db, 'games', code), newGame);
    return code;
};

// --- REAL-TIME SYNC ---
export const subscribeToGame = (code: string, callback: (game: Game | null) => void) => {
    return onSnapshot(doc(db, 'games', code), (doc) => {
        if (doc.exists()) callback(doc.data() as Game);
        else callback(null);
    });
};

export const updateGame = async (code: string, updates: Partial<Game>) => {
    await updateDoc(doc(db, 'games', code), {
        ...updates,
        lastUpdate: Date.now()
    });
};

export const deleteGame = async (code: string) => {
    await deleteDoc(doc(db, 'games', code));
};