// src/services/tournamentService.ts
// (Keep your existing imports at the top, but ADD these:)
import { initializeNewGame } from './gameService';
import type { SportType } from '../core/types';

// ... (Keep createTournament, joinTournament, etc. AS IS) ...

// REPLACE 'startTournamentMatch' WITH THIS:
export const startTournamentMatch = async (tournamentId: string, fixtureId: string, fixtureData: any): Promise<string> => {
    
    // 1. Determine Sport (Default to basketball if missing)
    const sport: SportType = (fixtureData.sport as SportType) || 'basketball';

    // 2. Initialize via Factory
    const gameCode = await initializeNewGame(
        { tournamentId, matchId: fixtureId },
        { name: fixtureData.teamA, color: '#EF4444' }, // Red
        { name: fixtureData.teamB, color: '#3B82F6' }, // Blue
        sport,
        "SYSTEM_ADMIN" // Or auth.currentUser.uid
    );

    // 3. Link Game to Fixture
    // (Assuming you have db import here)
    // await updateDoc(doc(db, `tournaments/${tournamentId}/fixtures`, fixtureId), {
    //    status: 'live',
    //    gameCode: gameCode
    // });

    return gameCode;
};