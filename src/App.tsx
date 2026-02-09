// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Page & Component Imports
import { UniversalScoreboard } from './components/display/UniversalScoreboard';
import { TabletController } from './pages/TabletController';
import { Dashboard } from './pages/Dashboard';
import { TournamentManager } from './pages/TournamentManager';
import { TournamentSetup } from './pages/TournamentSetup';
import { GameSetup } from './pages/GameSetup';
import ProtectedHostRoute from './components/ProtectedHostRoute';

// Wrapper to extract the gameCode from the URL safely
const UniversalScoreboardWrapper = () => {
    const code = window.location.pathname.split('/').pop() || '';
    return <UniversalScoreboard gameCode={code} />;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        <Routes>
          {/* --- PUBLIC VIEWS (No Login Required) --- */}
          {/* This route handles the spectator scoreboard display */}
          <Route path="/watch/:gameCode" element={<UniversalScoreboardWrapper />} />
          
          {/* --- PROTECTED ROUTES (Require Login) --- */}
          {/* Main Dashboard */}
          <Route path="/dashboard" element={<ProtectedHostRoute><Dashboard /></ProtectedHostRoute>} />
          
          {/* Quick Game Setup */}
          <Route path="/setup" element={<ProtectedHostRoute><GameSetup /></ProtectedHostRoute>} />
          
          {/* Tournament Creation Wizard */}
          <Route path="/tournament/create" element={<ProtectedHostRoute><TournamentSetup /></ProtectedHostRoute>} />
          
          {/* Tournament Management Console */}
          <Route path="/tournament/:id/manage" element={<ProtectedHostRoute><TournamentManager /></ProtectedHostRoute>} />
          
          {/* The Tablet Controller (Hardware Interface) */}
          <Route path="/tablet/:gameCode" element={<ProtectedHostRoute><TabletController /></ProtectedHostRoute>} />
          
          {/* Default Redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;