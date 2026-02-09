// src/pages/GameSetup.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { createGame } from '../services/gameService';
import { SportSelector } from '../components/setup/SportSelector';
import { getSportConfig } from '../services/sportLoader';
import type { SportType } from '../core/types';

export const GameSetup: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // STEP 0: Sport Selection
  const [selectedSport, setSelectedSport] = useState<SportType | null>(null);

  // STEP 1: Team Setup
  const [gameName, setGameName] = useState('');
  const [teamAName, setTeamAName] = useState('');
  const [teamAColor, setTeamAColor] = useState('#3B82F6');
  const [teamBName, setTeamBName] = useState('');
  const [teamBColor, setTeamBColor] = useState('#EF4444');
  const [trackStats, setTrackStats] = useState(false);

  // Get sport config if sport is selected
  const sportConfig = selectedSport ? getSportConfig(selectedSport) : null;

  const handleCreateGame = async () => {
    if (!currentUser || !selectedSport) return;

    try {
      const gameCode = await createGame({
        sport: selectedSport,
        hostId: currentUser.uid,
        hostName: currentUser.displayName || 'Host',
        gameName: gameName || `${teamAName} vs ${teamBName}`,
        teamA: {
          name: teamAName || 'Team A',
          color: teamAColor,
        },
        teamB: {
          name: teamBName || 'Team B',
          color: teamBColor,
        },
        trackPlayerStats: trackStats,
      });

      // Navigate to tablet controller
      navigate(`/tablet/${gameCode}`);
    } catch (error) {
      console.error('Failed to create game:', error);
      alert('Failed to create game. Please try again.');
    }
  };

  // STEP 0: Show Sport Selector
  if (!selectedSport) {
    return <SportSelector onSelectSport={setSelectedSport} />;
  }

  // STEP 1+: Team Setup (existing UI from boxv2)
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
        {/* Header with Sport Indicator */}
        <div className="bg-zinc-950 border-b border-zinc-800 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedSport(null)} 
              className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-400 hover:bg-white hover:text-black transition-all"
            >
              ←
            </button>
            <div>
              <h1 className="text-xl font-black tracking-tight uppercase italic text-white flex items-center gap-3">
                <span className="text-3xl">{sportConfig?.meta.icon}</span>
                {sportConfig?.meta.name} SETUP
              </h1>
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-1">
                Configure Teams & Settings
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Game Name */}
          <div className="mb-6">
            <label className="text-[10px] font-bold text-zinc-500 tracking-widest block mb-2 uppercase">
              Match Title
            </label>
            <input
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full bg-black border border-zinc-800 p-4 text-base font-bold text-white placeholder-zinc-700 outline-none rounded-lg focus:border-blue-500 transition-all uppercase"
              placeholder="E.G. CHAMPIONSHIP FINAL"
            />
          </div>

          {/* Teams */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Team A */}
            <div className="bg-black border border-zinc-700 p-5 rounded-xl">
              <label className="text-[9px] font-bold text-zinc-500 tracking-widest block uppercase mb-2">
                Home Team
              </label>
              <div className="flex gap-4 mb-2 items-center">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-zinc-700"
                  style={{ background: teamAColor }}
                />
                <input
                  value={teamAName}
                  onChange={(e) => setTeamAName(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-bold uppercase text-white outline-none placeholder-zinc-700"
                  placeholder="TEAM A"
                />
              </div>
              <input
                type="color"
                value={teamAColor}
                onChange={(e) => setTeamAColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            {/* Team B */}
            <div className="bg-black border border-zinc-700 p-5 rounded-xl">
              <label className="text-[9px] font-bold text-zinc-500 tracking-widest block uppercase mb-2">
                Guest Team
              </label>
              <div className="flex gap-4 mb-2 items-center">
                <div 
                  className="w-10 h-10 rounded-full border-2 border-zinc-700"
                  style={{ background: teamBColor }}
                />
                <input
                  value={teamBName}
                  onChange={(e) => setTeamBName(e.target.value)}
                  className="flex-1 bg-transparent text-lg font-bold uppercase text-white outline-none placeholder-zinc-700"
                  placeholder="TEAM B"
                />
              </div>
              <input
                type="color"
                value={teamBColor}
                onChange={(e) => setTeamBColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Track Stats Toggle */}
          <div className="mb-8">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={trackStats}
                onChange={(e) => setTrackStats(e.target.checked)}
                className="w-5 h-5"
              />
              <span className="text-sm font-bold text-zinc-400">Track Player Statistics</span>
            </label>
          </div>

          {/* Create Button */}
          <button
            onClick={handleCreateGame}
            disabled={!teamAName || !teamBName}
            className="w-full bg-white hover:bg-zinc-200 text-black font-black py-4 rounded-xl uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Launch {sportConfig?.meta.name} Game <span className="text-xl">→</span>
          </button>
        </div>
      </div>
    </div>
  );
};