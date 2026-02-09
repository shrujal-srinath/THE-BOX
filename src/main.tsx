// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'        // Ensure Tailwind/Index CSS is loaded
import './styles/global.css' // Ensure Custom Global Styles are loaded

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)