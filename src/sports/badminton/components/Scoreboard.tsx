// src/sports/badminton/components/Scoreboard.tsx
import React from 'react';
import type { Game } from '../../../core/types';

export const BadmintonScoreboard: React.FC<{ game: Game }> = ({ game }) => {
  const isServer = (team: 'A' | 'B') => game.state.possession === team;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>

      <header className="flex justify-between items-center p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur z-10">
        <h1 className="text-xl font-black italic tracking-tighter text-zinc-500">OFFICIAL SCOREBOARD <span className="text-green-600 not-italic ml-2 text-xs border border-green-900 px-2 py-0.5 rounded">BADMINTON</span></h1>
        <div className="text-xs font-mono text-zinc-600 tracking-widest">{game.code}</div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-7xl grid grid-cols-[1fr_auto_1fr] gap-8 md:gap-16 items-center">
          
          {/* TEAM A */}
          <div className="flex flex-col items-center relative">
            {isServer('A') && <div className="absolute -top-12 text-4xl animate-bounce">🏸</div>}
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 text-center tracking-tight" style={{ color: game.teams.A.color }}>{game.teams.A.name}</h2>
            <div className={`bg-zinc-900/50 border-4 rounded-3xl p-8 min-w-[280px] text-center shadow-2xl ${isServer('A') ? 'border-yellow-500' : 'border-zinc-800'}`}>
              <span className="text-[12rem] md:text-[16rem] font-bold leading-none font-mono text-white">{game.teams.A.score}</span>
            </div>
          </div>

          {/* CENTER INFO */}
          <div className="flex flex-col items-center gap-8 z-10">
            <div className="bg-zinc-900 px-8 py-4 rounded-xl border border-zinc-700 text-white font-black tracking-widest text-2xl shadow-lg flex flex-col items-center">
              <span className="text-[10px] text-zinc-500 font-normal mb-1">SET</span>
              {game.state.currentPeriod}
            </div>
            <div className="h-32 w-1 bg-zinc-800 rounded-full"></div>
          </div>

          {/* TEAM B */}
          <div className="flex flex-col items-center relative">
            {isServer('B') && <div className="absolute -top-12 text-4xl animate-bounce">🏸</div>}
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 text-center tracking-tight" style={{ color: game.teams.B.color }}>{game.teams.B.name}</h2>
            <div className={`bg-zinc-900/50 border-4 rounded-3xl p-8 min-w-[280px] text-center shadow-2xl ${isServer('B') ? 'border-yellow-500' : 'border-zinc-800'}`}>
              <span className="text-[12rem] md:text-[16rem] font-bold leading-none font-mono text-white">{game.teams.B.score}</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};
