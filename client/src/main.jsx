import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { loader } from '@monaco-editor/react'

// --- FIX MONACO EDITOR ---
// Configuriamo il loader per usare una CDN specifica.
// Questo risolve l'errore 404 su "stackframe.js" e altri worker,
// perché li cercherà sul web invece che nella tua cartella locale.
loader.config({
  paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.46.0/min/vs' },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  // NOTA: Ho commentato StrictMode perché con Monaco Editor + Vite
  // spesso causa l'errore "Duplicate definition" caricando il modulo due volte.
  // <React.StrictMode>
    <App />
  // </React.StrictMode>,
)