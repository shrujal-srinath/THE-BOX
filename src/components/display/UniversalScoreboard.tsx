// src/components/display/UniversalScoreboard.tsx
import React from 'react';
import { useGame } from '../../hooks/useGame';
import { BasketballScoreboard } from '../../sports/basketball/components/Scoreboard';
import { BadmintonScoreboard } from '../../sports/badminton/components/Scoreboard';

interface Props {
  gameCode: string;
}

export const UniversalScoreboard: React.FC<Props> = ({ gameCode }) => {
  const { game, loading } = useGame(gameCode);

  if (loading || !game) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white font-mono animate-pulse">
        CONNECTING TO SATELLITE...
      </div>
    );
  }

  // THE ROUTER: DECIDES WHICH SCOREBOARD TO SHOW
  switch (game.sport) {
    case 'basketball':
      return <BasketballScoreboard game={game} />;
    case 'badminton':
      return <BadmintonScoreboard game={game} />;
    default:
      return (
        <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-mono">
          ERROR: UNKNOWN SPORT PROTOCOL ({game.sport})
        </div>
      );
  }
};