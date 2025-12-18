import React from 'react';
import { X, Trash2, Upload, Sun, Moon, Languages, Save, Download } from 'lucide-react'; // Added icons for mobile actions
import './Sidebar.css';

// Componente SVG per l'icona del file .py sfumato
const PyFileIconSvg = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="py-file-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#306998" />
        <stop offset="100%" stopColor="#FFD43B" />
      </linearGradient>
    </defs>
    {/* Sagoma del file */}
    <path d="M14.5 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V7.5L14.5 2Z" stroke="url(#py-file-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <polyline points="14 2 14 8 20 8" stroke="url(#py-file-gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    {/* Testo "PY" interno */}
    <text x="7.5" y="17" fill="url(#py-file-gradient)" fontSize="9" fontWeight="800" fontFamily="Arial, sans-serif">PY</text>
  </svg>
);

const Sidebar = ({
  isOpen,
  setIsOpen,
  savedFiles,
  loadSavedFile,
  deleteSavedFile,
  handleImportClick,
  fileInputRef,
  handleFileChange,
  t,
  // Props for mobile actions
  toggleTheme,
  theme,
  toggleLang,
  lang,
  handleSave,
  handleDownload
}) => {
  return (
    <div className={`sidebar ${!isOpen ? 'closed' : ''}`}>
      <div className="sidebar-header">
        <span>{t.sidebarTitle}</span>
        <button
          className="icon-btn"
          onClick={() => setIsOpen(false)}
          style={{ border: 'none', background: 'transparent' }}
        >
          <X size={20} />
        </button>
      </div>

      <ul className="file-list">
        {savedFiles.length === 0 && (
          <li style={{ padding: '20px', color: '#555', textAlign: 'center', fontSize: '0.85rem' }}>
            {t.noFiles}
          </li>
        )}
        {savedFiles.map(file => (
          <li key={file.id} className="file-item" onClick={() => loadSavedFile(file.content)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
              {/* MODIFICA: Sostituito FolderOpen con la nuova icona SVG */}
              <PyFileIconSvg size={20} />
              <span title={file.name} style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</span>
            </div>
            <button className="delete-btn" onClick={(e) => deleteSavedFile(e, file.id)}>
              <Trash2 size={14} />
            </button>
          </li>
        ))}
      </ul>

      <div className="import-section">
        <input
          type="file"
          accept=".py,.txt"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button className="import-btn" onClick={handleImportClick}>
          <Upload size={16} /> {t.importBtn}
        </button>
      </div>

      {/* Mobile Settings Footer */}
      <div className="sidebar-mobile-footer">
        <div className="mobile-actions-grid">
          <button className="mobile-action-btn" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            <span>Theme</span>
          </button>
          <button className="mobile-action-btn" onClick={toggleLang}>
            <Languages size={18} />
            <span>{lang.toUpperCase()}</span>
          </button>
          <button className="mobile-action-btn" onClick={handleSave}>
            <Save size={18} />
            <span>Save</span>
          </button>
          <button className="mobile-action-btn" onClick={handleDownload}>
            <Download size={18} />
            <span>Down</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Sidebar);