// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameSetup } from './pages/GameSetup';
import { TabletController } from './pages/TabletController';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-black text-white">
        <Routes>
          {/* Main Routes */}
          <Route path="/" element={<Navigate to="/setup" replace />} />
          <Route path="/setup" element={<GameSetup />} />
          <Route path="/tablet/:gameCode" element={<TabletController />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/setup" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;