import React from 'react';
import { X, Menu, Languages, Sun, Moon, Save, Download, Lightbulb, LightbulbOff, Bug, Play } from 'lucide-react';
import './Header.css';

// Componente SVG Python corretto (ViewBox 128x128)
const PythonLogoSvg = () => (
  <svg
    width="38"
    height="38"
    viewBox="0 0 128 128"
    xmlns="http://www.w3.org/2000/svg"
    className="python-logo-svg"
    style={{ flexShrink: 0 }} // Fondamentale per non essere schiacciato
  >
    <defs>
      <linearGradient id="py-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#306998" />
        <stop offset="100%" stopColor="#FFD43B" />
      </linearGradient>
    </defs>

    {/* Serpente Superiore */}
    <path
      fill="url(#py-logo-gradient)"
      d="M63.38 8.87C48.77 8.87 35.88 15.11 35.88 28.32v9.75h29.04v4.34H34.25C18.06 42.41 4.93 54.02 4.93 70.36c0 12.85 10.41 22.15 23.59 22.94V82.59c0-12.23 9.83-22.06 22.07-22.06h32.76c6.12 0 11.03-4.91 11.03-11.03V28.32c0-13.21-14.38-19.45-31-19.45zM48.06 19.34c2.75 0 5 2.25 5 5s-2.25 5-5 5-5-2.25-5-5 2.25-5 5-5z"
    />

    {/* Serpente Inferiore */}
    <path
      fill="url(#py-logo-gradient)"
      d="M98.63 34.69v10.72c0 12.23-9.83 22.06-22.07 22.06H43.81c-6.12 0-11.03 4.91-11.03 11.03v21.18c0 13.21 14.37 19.45 30.99 19.45 14.61 0 27.5-6.24 27.5-19.45V89.93h-29.04v-4.34h30.67c16.19 0 29.32-11.61 29.32-27.95 0-12.85-10.41-22.15-23.59-22.95zM80 98.66c2.75 0 5 2.25 5 5s-2.25 5-5 5-5-2.25-5-5 2.25-5 5-5z"
    />
  </svg>
);

const Header = ({
  isSidebarOpen,
  setIsSidebarOpen,
  toggleLang,
  lang,
  toggleTheme,
  theme,
  handleSave,
  handleDownload,
  showHints,
  setShowHints,
  isDebug,
  setIsDebug,
  setDebugTrace,
  runCode,
  runDebug,
  pyodide,
  isRunning,
  t
}) => {
  return (
    <div className="header">
      <div className="header-left">
        <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* TITOLO CON LOGO */}
        <div className="brand-container">
          <PythonLogoSvg />
          <h1>
            <span style={{ color: '#306998' }}>Py</span>
            <span style={{ color: '#FFD43B' }}>Tutor</span>
            <span style={{ color: '#8d8d8dff' }}> AI</span>
          </h1>
        </div>
      </div>

      <div className="controls">
        <div className="desktop-only-controls">
          <button className="icon-btn" onClick={toggleLang} title="Lang" style={{ width: 'auto', padding: '0 10px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            <Languages size={18} style={{ marginRight: 5 }} /> {lang.toUpperCase()}
          </button>

          <button className="icon-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="divider"></div>

          <button className="icon-btn" onClick={handleSave} title={t.saveTitle}>
            <Save size={20} />
          </button>

          <button className="icon-btn" onClick={handleDownload} title={t.downloadTitle}>
            <Download size={20} />
          </button>

          <div className="divider"></div>
        </div>

        <button
          className={`icon-btn ${showHints ? 'active' : ''}`}
          onClick={() => setShowHints(!showHints)}
          title={t.hints}
        >
          {showHints ? <Lightbulb size={20} className="icon-yellow" /> : <LightbulbOff size={20} />}
        </button>

        <button
          className={`icon-btn ${isDebug ? 'active-red' : ''}`}
          onClick={() => { setIsDebug(!isDebug); setDebugTrace(null); }}
          title={t.debug}
        >
          <Bug size={20} />
        </button>

        <button
          onClick={isDebug ? runDebug : runCode}
          disabled={!pyodide || isRunning}
          className="icon-btn play-btn"
          title={isDebug ? t.debugBtn : t.runBtn}
          style={{ backgroundColor: isDebug ? 'var(--warning-color)' : 'var(--accent-color)' }}
        >
          {isRunning ? '...' : <Play size={24} fill="white" />}
        </button>
      </div>
    </div>
  );
};

export default React.memo(Header);