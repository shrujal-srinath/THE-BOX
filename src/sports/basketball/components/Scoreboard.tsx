// src/sports/basketball/components/Scoreboard.tsx
import React from 'react';
import type { Game } from '../../../core/types';

export const BasketballScoreboard: React.FC<{ game: Game }> = ({ game }) => {
  const formatTime = (t: { minutes: number; seconds: number }) => 
    `${t.minutes.toString().padStart(2, '0')}:${t.seconds.toString().padStart(2, '0')}`;

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col overflow-hidden relative">
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))', backgroundSize: '100% 2px, 3px 100%' }}></div>

      <header className="flex justify-between items-center p-6 border-b border-zinc-900 bg-zinc-950/50 backdrop-blur z-10">
        <h1 className="text-xl font-black italic tracking-tighter text-zinc-500">OFFICIAL SCOREBOARD</h1>
        <div className="text-xs font-mono text-zinc-600 tracking-widest">{game.code}</div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 z-10">
        <div className="w-full max-w-7xl grid grid-cols-[1fr_auto_1fr] gap-8 md:gap-16 items-center">
          
          {/* TEAM A */}
          <div className="flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 text-center tracking-tight" style={{ color: game.teams.A.color }}>{game.teams.A.name}</h2>
            <div className="bg-zinc-900/50 border-4 border-zinc-800 rounded-3xl p-8 min-w-[280px] text-center shadow-2xl relative">
              <span className="text-[12rem] md:text-[16rem] font-bold leading-none font-mono text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{game.teams.A.score}</span>
            </div>
          </div>

          {/* CLOCK */}
          <div className="flex flex-col items-center gap-8 z-10">
            <div className="bg-zinc-900 px-8 py-2 rounded-full border border-zinc-700 text-zinc-400 font-bold tracking-[0.2em] text-xl shadow-lg">Q{game.state.currentPeriod}</div>
            <div className="bg-black border-8 border-zinc-800 rounded-3xl p-8 shadow-2xl min-w-[320px] text-center">
              <div className={`text-[6rem] md:text-[8rem] font-mono font-bold leading-none tracking-tight ${game.state.clock.game.minutes === 0 ? 'text-red-500' : 'text-white'}`}>
                {formatTime(game.state.clock.game)}
              </div>
            </div>
            {game.state.clock.secondary !== null && (
               <div className="bg-zinc-900 border-4 border-zinc-700 rounded-2xl p-6 min-w-[200px] text-center shadow-xl">
                 <div className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-2">Shot Clock</div>
                 <div className="text-6xl font-mono font-bold text-amber-500">{game.state.clock.secondary}</div>
               </div>
            )}
          </div>

          {/* TEAM B */}
          <div className="flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-black uppercase mb-4 text-center tracking-tight" style={{ color: game.teams.B.color }}>{game.teams.B.name}</h2>
            <div className="bg-zinc-900/50 border-4 border-zinc-800 rounded-3xl p-8 min-w-[280px] text-center shadow-2xl relative">
              <span className="text-[12rem] md:text-[16rem] font-bold leading-none font-mono text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">{game.teams.B.score}</span>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};