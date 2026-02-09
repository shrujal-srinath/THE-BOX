// src/components/setup/SportSelector.tsx
import React from 'react';
import { getAllSportMeta } from '../../services/sportLoader';
import type { SportType } from '../../core/types';

interface SportSelectorProps {
  onSelectSport: (sport: SportType) => void;
}

export const SportSelector: React.FC<SportSelectorProps> = ({ onSelectSport }) => {
  const availableSports = getAllSportMeta();

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black italic text-white mb-4 tracking-tight">
            SELECT SPORT
          </h1>
          <div className="w-32 h-1 bg-zinc-700 mx-auto"></div>
        </div>

        {/* Sport Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {availableSports.map(sport => (
            <button
              key={sport.id}
              onClick={() => onSelectSport(sport.id as SportType)}
              className="group relative overflow-hidden rounded-2xl border-2 border-zinc-800 bg-black hover:border-zinc-600 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              {/* Sport Color Strip */}
              <div 
                className="absolute top-0 left-0 right-0 h-2 transition-all group-hover:h-3"
                style={{ backgroundColor: sport.color }}
              />

              {/* Content */}
              <div className="p-8 pt-12">
                {/* Icon */}
                <div className="text-8xl mb-6 filter grayscale group-hover:grayscale-0 transition-all">
                  {sport.icon}
                </div>

                {/* Name */}
                <h2 className="text-3xl font-black uppercase text-white mb-3 tracking-tight">
                  {sport.name}
                </h2>

                {/* Description */}
                <p className="text-zinc-500 text-sm font-mono uppercase tracking-wider">
                  {sport.description}
                </p>

                {/* Hover Glow Effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity"
                  style={{ 
                    background: `radial-gradient(circle at center, ${sport.color}, transparent 70%)` 
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <p className="text-zinc-600 text-xs font-mono uppercase tracking-widest">
            Hardware-Grade Scoring System • Multi-Sport Platform
          </p>
        </div>
      </div>
    </div>
  );
};