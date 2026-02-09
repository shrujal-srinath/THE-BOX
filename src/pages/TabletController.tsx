// src/pages/TabletController.tsx
import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import '../styles/hardware.css';

export const TabletController: React.FC = () => {
  const { gameCode } = useParams<{ gameCode: string }>();
  const navigate = useNavigate();
  const { game, config, recordScore, toggleGameClock, undoLastAction } = useGame(gameCode || '');

  // Set sport theme on body
  useEffect(() => {
    if (game?.sport) {
      document.body.setAttribute('data-sport', game.sport);
    }
    return () => {
      document.body.removeAttribute('data-sport');
    };
  }, [game?.sport]);

  if (!game || !config) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-green-500 font-mono text-2xl">
        INITIALIZING SYSTEM...
      </div>
    );
  }

  const renderTeamControls = (team: 'A' | 'B') => (
    <div className="flex-1 bg-zinc-900/50 p-4 border border-zinc-800 relative rounded-xl overflow-hidden flex flex-col">
      {/* Team Color Strip */}
      <div 
        className="absolute top-0 left-0 w-2 h-full" 
        style={{ backgroundColor: game.teams[team].color }} 
      />
      
      {/* Header */}
      <div className="flex justify-between items-end mb-4 ml-4">
        <h2 className="text-2xl font-black text-white uppercase truncate">
          {game.teams[team].name}
        </h2>
        <span className="text-5xl font-mono font-bold text-white">
          {game.teams[team].score}
        </span>
      </div>
      
      {/* Dynamic Score Buttons */}
      <div className="grid grid-cols-2 gap-3 flex-1 content-start">
        {config.actions.scores.map(action => (
          <button
            key={action.id}
            onClick={() => recordScore(team, action.id)}
            className="hw-button h-24 bg-zinc-800 text-white font-bold text-xl rounded-lg hover:bg-zinc-700 active:scale-95 transition-all border-l-4 flex flex-col items-center justify-center"
            style={{ borderColor: action.color }}
          >
            <span className="text-2xl mb-1">{action.icon}</span>
            {action.shortLabel || action.label}
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
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>{gameCode} • {config.meta.name.toUpperCase()}</span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="text-zinc-500 hover:text-white transition-colors"
        >
          EXIT
        </button>
      </div>

      {/* SCOREBOARD */}
      <div className="bg-zinc-900 p-4 rounded flex justify-between items-center">
        {/* Team A */}
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ background: game.teams.A.color }} />
          <span className="text-white font-bold">{game.teams.A.name}</span>
          <span className="text-4xl font-mono font-bold text-white">{game.teams.A.score}</span>
        </div>

        {/* Center Info */}
        <div className="text-center">
          <div className="text-zinc-500 text-xs font-mono uppercase mb-1">
            {config.rules.periodConfig.label(game.state.currentPeriod)}
          </div>
          {config.display.showClock && (
            <div className="text-2xl font-mono font-bold text-white">
              {game.state.clock.game.minutes}:{game.state.clock.game.seconds.toString().padStart(2, '0')}
            </div>
          )}
        </div>

        {/* Team B */}
        <div className="flex items-center gap-3">
          <span className="text-4xl font-mono font-bold text-white">{game.teams.B.score}</span>
          <span className="text-white font-bold">{game.teams.B.name}</span>
          <div className="w-3 h-3 rounded-full" style={{ background: game.teams.B.color }} />
        </div>
      </div>

      {/* TEAM CONTROLS */}
      <div className="flex-1 flex gap-2 overflow-hidden">
        {renderTeamControls('A')}
        {renderTeamControls('B')}
      </div>

      {/* BOTTOM CONTROLS */}
      <div className="bg-zinc-900 p-3 rounded flex gap-2">
        {config.display.showClock && (
          <button
            onClick={() => toggleGameClock()}
            className="flex-1 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded transition-all active:scale-95"
          >
            {game.state.clock.gameRunning ? 'STOP' : 'START'}
          </button>
        )}
        <button
          onClick={() => undoLastAction()}
          className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-3 rounded transition-all active:scale-95"
        >
          UNDO
        </button>
      </div>
    </div>
  );
};