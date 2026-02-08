// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UniversalScoreboard } from './components/display/UniversalScoreboard';
import { TabletController } from './pages/TabletController';
import { Dashboard } from './pages/Dashboard';
import { TournamentManager } from './pages/TournamentManager';
import { TournamentSetup } from './pages/TournamentSetup';
import ProtectedHostRoute from './components/ProtectedHostRoute';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white font-sans">
        <Routes>
          {/* PUBLIC VIEWS */}
          <Route path="/watch/:gameCode" element={<UniversalScoreboardWrapper />} />
          
          {/* PROTECTED ROUTES */}
          <Route path="/dashboard" element={<ProtectedHostRoute><Dashboard /></ProtectedHostRoute>} />
          <Route path="/tournament/create" element={<ProtectedHostRoute><TournamentSetup /></ProtectedHostRoute>} />
          <Route path="/tournament/:id/manage" element={<ProtectedHostRoute><TournamentManager /></ProtectedHostRoute>} />
          
          {/* TABLET CONTROLLER */}
          <Route path="/tablet/:gameCode" element={<ProtectedHostRoute><TabletController /></ProtectedHostRoute>} />
          
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

// Wrapper to extract param safely
const UniversalScoreboardWrapper = () => {
    const code = window.location.pathname.split('/').pop() || '';
    return <UniversalScoreboard gameCode={code} />;
};

export default App;