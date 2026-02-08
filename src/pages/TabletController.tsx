// src/pages/TabletController.tsx
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import '../styles/hardware.css';

export const TabletController: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const { game, config, recordScore, undoLastAction, toggleClock, togglePossession } = useGame(gameCode || '');

  if (!game || !config) return <div className="h-screen bg-black flex items-center justify-center text-green-500 font-mono">INITIALIZING SYSTEM...</div>;

  const renderTeamControls = (team: 'A' | 'B') => (
    <div className="flex-1 bg-zinc-900/50 p-4 border border-zinc-800 relative rounded-xl overflow-hidden flex flex-col">
       <div className="absolute top-0 left-0 w-2 h-full" style={{ backgroundColor: game.teams[team].color }} />
       <div className="flex justify-between items-end mb-4 ml-4">
         <h2 className="text-2xl font-black text-white uppercase truncate">{game.teams[team].name}</h2>
         <span className="text-5xl font-mono font-bold text-white">{game.teams[team].score}</span>
       </div>
       
       <div className="grid grid-cols-2 gap-3 flex-1 content-start">
         {config.actions.scores.map(action => (
           <button
             key={action.id}
             onClick={() => recordScore(team, action.id)}
             className="hw-button h-24 bg-zinc-800 text-white font-bold text-xl rounded-lg hover:bg-zinc-700 active:scale-95 transition-all border-l-4 flex flex-col items-center justify-center"
             style={{ borderColor: action.color }}
           >
             <span className="text-2xl mb-1">{action.icon}</span>
             {action.label}
           </button>
         ))}
       </div>
    </div>
  );

  return (
    <div className="h-screen bg-black flex flex-col p-2 gap-2 overflow-hidden">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-zinc-900 p-3 rounded text-zinc-400 font-mono text-sm">
        <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/>
            <span>{gameCode} • {config.meta.name.toUpperCase()}</span>
        </div>
        <button onClick={() => navigate('/dashboard')} className="text-red-500 font-bold hover:text-white">EXIT</button>
      </div>

      {/* TEAMS AREA */}
      <div className="flex-1 flex gap-2 min-h-0">
        {renderTeamControls('A')}
        {renderTeamControls('B')}
      </div>

      {/* GLOBAL CONTROLS */}
      <div className="h-20 grid grid-cols-4 gap-2">
         <button onClick={undoLastAction} className="bg-zinc-800 text-zinc-500 font-bold uppercase text-xs rounded hover:text-white">UNDO LAST</button>
         
         <button onClick={togglePossession} className="bg-zinc-800 text-white font-bold uppercase text-xs rounded flex flex-col items-center justify-center">
            <span className="text-[10px] text-zinc-500">POSSESSION</span>
            <span className="text-yellow-500 text-xl">{game.state.possession}</span>
         </button>

         {config.rules.timing.hasGameClock && (
            <button 
                onClick={toggleClock} 
                className={`col-span-2 font-black text-2xl rounded transition-colors ${game.state.clock.gameRunning ? 'bg-red-600 text-white animate-pulse' : 'bg-green-600 text-white'}`}
            >
                {game.state.clock.gameRunning ? 'STOP CLOCK' : 'START CLOCK'}
            </button>
         )}
      </div>
    </div>
  );
};