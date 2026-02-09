// src/pages/Dashboard.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-black mb-8">DASHBOARD</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <button
            onClick={() => navigate('/setup')}
            className="p-8 bg-zinc-900 border-2 border-zinc-800 rounded-xl hover:border-white transition-all text-left"
          >
            <div className="text-4xl mb-4">🏀</div>
            <h2 className="text-2xl font-bold mb-2">Create Game</h2>
            <p className="text-zinc-500">Start a new multi-sport game</p>
          </button>

          <div className="p-8 bg-zinc-900 border-2 border-zinc-800 rounded-xl opacity-50">
            <div className="text-4xl mb-4">📊</div>
            <h2 className="text-2xl font-bold mb-2">Game History</h2>
            <p className="text-zinc-500">Coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
};