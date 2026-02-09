// src/pages/GameSetup.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeNewGame } from '../services/gameService';
import type { SportType } from '../core/types';

export const GameSetup: React.FC = () => {
  const navigate = useNavigate();
  const [sport, setSport] = useState<SportType>('basketball');
  const [teamA, setTeamA] = useState("Team A");
  const [teamB, setTeamB] = useState("Team B");
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    setIsCreating(true);
    try {
      const code = await initializeNewGame(
        {}, 
        { name: teamA, color: '#EF4444' }, 
        { name: teamB, color: '#3B82F6' }, 
        sport, 
        'LOCAL_HOST'
      );
      // FIXED: Navigate to Tablet Controller
      navigate(`/tablet/${code}`);
    } catch (e) {
      console.error(e);
      alert("Error creating game");
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl">
        <h1 className="text-2xl font-black italic uppercase mb-6 text-center">Setup New Match</h1>
        
        {/* SPORT SELECTOR */}
        <div className="mb-6">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-2 block">Select Sport</label>
            <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setSport('basketball')} className={`p-4 rounded border font-bold ${sport === 'basketball' ? 'bg-orange-600/20 border-orange-600 text-orange-500' : 'border-zinc-700 text-zinc-500'}`}>
                    🏀 Basketball
                </button>
                <button onClick={() => setSport('badminton')} className={`p-4 rounded border font-bold ${sport === 'badminton' ? 'bg-green-600/20 border-green-600 text-green-500' : 'border-zinc-700 text-zinc-500'}`}>
                    🏸 Badminton
                </button>
            </div>
        </div>

        <div className="space-y-4 mb-8">
            <input value={teamA} onChange={e => setTeamA(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 rounded font-bold" placeholder="Team A Name" />
            <input value={teamB} onChange={e => setTeamB(e.target.value)} className="w-full bg-black border border-zinc-700 p-3 rounded font-bold" placeholder="Team B Name" />
        </div>

        <button onClick={handleCreate} disabled={isCreating} className="w-full bg-white text-black font-black uppercase py-4 rounded tracking-widest hover:bg-zinc-200">
            {isCreating ? 'Creating...' : 'Launch System'}
        </button>
      </div>
    </div>
  );
};