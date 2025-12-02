import { useState, useEffect, useRef } from 'react'
import Editor from '@monaco-editor/react';
import axios from 'axios';
// Importiamo le nuove icone: Sun, Moon, Languages
import { Play, Save, Download, Menu, FolderOpen, Upload, Trash2, X, BrainCircuit, Sun, Moon, Languages } from 'lucide-react';
import './App.css'

// DIZIONARIO TRADUZIONI
const translations = {
  it: {
    headerTitle: "PyTutor",
    runBtn: "Esegui",
    running: "Esecuzione...",
    hints: "Suggerimenti",
    sidebarTitle: "Esplora File",
    noFiles: "Nessun file salvato",
    importBtn: "Importa .py locale",
    terminalTitle: "OUTPUT TERMINALE",
    statusExecuting: "In Esecuzione",
    statusIdle: "Pronto",
    waitingOutput: "In attesa di output...",
    traceback: "Errore rilevato:",
    explainBtn: "Spiegami l'errore",
    analyzing: "Analisi in corso...",
    tutorTitle: "Il Tutor suggerisce:",
    saveTitle: "Salva nel Browser",
    downloadTitle: "Scarica file .py",
    runTitle: "Esegui Codice",
    confirmOverride: "Caricare questo file sovrascriverà l'editor corrente. Continuare?",
    confirmDelete: "Sei sicuro di voler eliminare questo file?",
    promptSave: "Come vuoi chiamare questo file?",
    promptDownload: "Nome del file da scaricare:",
    alertAiError: "Errore connessione AI.",
    fileSaved: "File salvato come"
  },
  en: {
    headerTitle: "PyTutor",
    runBtn: "Run",
    running: "Running...",
    hints: "Hints",
    sidebarTitle: "File Explorer",
    noFiles: "No saved files",
    importBtn: "Import local .py",
    terminalTitle: "TERMINAL OUTPUT",
    statusExecuting: "Executing",
    statusIdle: "Idle",
    waitingOutput: "Waiting for output...",
    traceback: "Traceback detected:",
    explainBtn: "Explain error",
    analyzing: "Analyzing...",
    tutorTitle: "Tutor suggests:",
    saveTitle: "Save to Browser",
    downloadTitle: "Download .py file",
    runTitle: "Run Code",
    confirmOverride: "Loading this file will override the current editor. Continue?",
    confirmDelete: "Are you sure you want to delete this file?",
    promptSave: "What do you want to call this file?",
    promptDownload: "Filename to download:",
    alertAiError: "AI Connection Error.",
    fileSaved: "File saved as"
  }
};

function App() {
  // Configurazione iniziale (Placeholder in INGLESE come richiesto)
  const [code, setCode] = useState("# Write your Python code here\nprint('Hello World!')");
  
  // Stati Base
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [pyodide, setPyodide] = useState(null);
  const [error, setError] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showHints, setShowHints] = useState(true);

  // Stati File
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedFiles, setSavedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // NUOVI STATI: TEMA & LINGUA
  const [theme, setTheme] = useState('dark'); // 'dark' | 'light'
  const [lang, setLang] = useState('it');     // 'it' | 'en'

  // Helper per testi rapidi
  const t = translations[lang];

  // 1. Caricamento Iniziale
  useEffect(() => {
    // Pyodide
    async function loadPyodideEngine() {
      setOutput(["Loading Python environment..."]);
      try {
        const py = await window.loadPyodide();
        setPyodide(py);
        setOutput(prev => [...prev, "Ready! 🚀"]);
      } catch (err) {
        console.error(err);
        setOutput(prev => [...prev, "❌ Critical Error: Failed to load Pyodide."]);
      }
    }
    loadPyodideEngine();

    // LocalStorage Files
    const localFiles = localStorage.getItem('pytutor_files');
    if (localFiles) {
      setSavedFiles(JSON.parse(localFiles));
    }
    
    // Recupera preferenze tema/lingua se esistono (Opzionale)
    const savedTheme = localStorage.getItem('pytutor_theme');
    if (savedTheme) setTheme(savedTheme);
  }, []);

  // 2. Gestione Tema (Effect per applicare data-theme al body/div principale)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pytutor_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const toggleLang = () => {
    setLang(prev => prev === 'it' ? 'en' : 'it');
  };

  // 3. Funzioni Gestione File
  const handleSave = () => {
    const filename = prompt(t.promptSave, "script.py");
    if (!filename) return;

    const newFile = {
      id: Date.now(),
      name: filename.endsWith('.py') ? filename : `${filename}.py`,
      content: code,
      date: new Date().toLocaleDateString()
    };

    const updatedFiles = [...savedFiles, newFile];
    setSavedFiles(updatedFiles);
    localStorage.setItem('pytutor_files', JSON.stringify(updatedFiles));
    
    setIsSidebarOpen(true);
    // Opzionale: alert(t.fileSaved + " " + newFile.name);
  };

  const handleDownload = () => {
    const filename = prompt(t.promptDownload, "main.py");
    if (!filename) return;
    
    const finalName = filename.endsWith('.py') ? filename : `${filename}.py`;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = finalName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setCode(e.target.result);
      setIsSidebarOpen(false);
    };
    reader.readAsText(file);
    event.target.value = null; 
  };

  const loadSavedFile = (fileContent) => {
    if(confirm(t.confirmOverride)) {
        setCode(fileContent);
        if (window.innerWidth < 768) setIsSidebarOpen(false);
    }
  };

  const deleteSavedFile = (e, id) => {
    e.stopPropagation();
    if(confirm(t.confirmDelete)) {
        const updatedFiles = savedFiles.filter(f => f.id !== id);
        setSavedFiles(updatedFiles);
        localStorage.setItem('pytutor_files', JSON.stringify(updatedFiles));
    }
  };

  // 4. Esegui Codice
  const runCode = async () => {
    if (!pyodide) return;
    setIsRunning(true);
    setError(null);
    setAiExplanation(null);
    setOutput([]); 

    try {
      pyodide.setStdout({ batched: (msg) => setOutput(prev => [...prev, msg]) });
      await pyodide.runPythonAsync(code);
    } catch (err) {
      const errorMsg = err.message;
      setError(errorMsg);
    } finally {
      setIsRunning(false);
    }
  };

  // 5. AI Tutor
  const askTutor = async () => {
    if (!error) return;
    setLoadingAi(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010';
    try {
      const response = await axios.post(`${apiUrl}/explain`, {
        code: code,
        error_message: error,
        language: lang // Passiamo la lingua al backend se vuoi che l'AI risponda in EN/IT
      });
      setAiExplanation(response.data.explanation);
    } catch (err) {
      console.error(err);
      alert(t.alertAiError);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="main-layout">
      {/* --- SIDEBAR --- */}
      <div className={`sidebar ${!isSidebarOpen ? 'closed' : ''}`}>
        <div className="sidebar-header">{t.sidebarTitle}</div>
        
        <ul className="file-list">
          {savedFiles.length === 0 && <li style={{padding:'20px', color:'#555', fontStyle:'italic', fontSize:'0.85rem', textAlign:'center'}}>{t.noFiles}</li>}
          {savedFiles.map(file => (
            <li key={file.id} className="file-item" onClick={() => loadSavedFile(file.content)}>
              <div style={{display:'flex', alignItems:'center', gap:'10px', overflow:'hidden'}}>
                <FolderOpen size={16} color="var(--accent-color)" />
                <span title={file.name}>{file.name}</span>
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
            style={{display:'none'}} 
            onChange={handleFileChange} 
          />
          <button className="import-btn" onClick={handleImportClick}>
            <Upload size={16} /> {t.importBtn}
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="main-content">
        <div className="header">
          <div className="header-left">
            <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                {isSidebarOpen ? <X size={24}/> : <Menu size={24}/>}
            </button>
            <h1>🐍 {t.headerTitle}</h1>
          </div>
          
          <div className="controls">
              {/* Language Switcher */}
              <button className="icon-btn" onClick={toggleLang} title="Switch Language" style={{width: 'auto', padding: '0 10px', fontSize: '0.8rem', fontWeight: 'bold'}}>
                <Languages size={18} style={{marginRight: 5}}/> {lang.toUpperCase()}
              </button>

              {/* Theme Toggle */}
              <button className="icon-btn" onClick={toggleTheme} title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}>
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
              </button>

              <div style={{width: 1, height: 25, background: 'var(--border-color)', margin: '0 5px'}}></div>

              {/* Toggle Hints */}
              <div className="toggle-container">
                  <span className="toggle-label">{t.hints}</span>
                  <label className="switch">
                      <input 
                          type="checkbox" 
                          checked={showHints} 
                          onChange={(e) => setShowHints(e.target.checked)} 
                      />
                      <span className="slider round"></span>
                  </label>
              </div>

              {/* Toolbar Buttons */}
              <button className="icon-btn" onClick={handleSave} title={t.saveTitle}>
                <Save size={20} />
              </button>
              
              <button className="icon-btn" onClick={handleDownload} title={t.downloadTitle}>
                <Download size={20} />
              </button>

              <button 
                onClick={runCode} 
                disabled={!pyodide || isRunning} 
                className="icon-btn play-btn"
                title={t.runTitle}
              >
                 {isRunning ? '...' : <Play size={24} fill="white" />}
                 {/* Opzionale: mostrare testo su desktop */}
                 <span style={{marginLeft: 8, display: window.innerWidth < 600 ? 'none' : 'inline'}}>{t.runBtn}</span>
              </button>
          </div>
        </div>

        <div className="container">
          {/* EDITOR */}
          <div className="editor-pane">
            <Editor
              height="100%"
              defaultLanguage="python"
              // Cambio tema dinamico: Monaco ha 'vs-dark' e 'light'
              theme={theme === 'dark' ? "vs-dark" : "light"}
              value={code}
              onChange={(value) => setCode(value)}
              options={{ 
                  minimap: { enabled: false }, 
                  fontSize: 16, 
                  scrollBeyondLastLine: false,
                  padding: { top: 20, bottom: 20 },
                  automaticLayout: true,
                  quickSuggestions: showHints, 
                  suggestOnTriggerCharacters: showHints, 
                  parameterHints: { enabled: showHints },
                  wordBasedSuggestions: showHints,
                  hover: { enabled: showHints },
              }}
            />
          </div>

          {/* OUTPUT */}
          <div className="output-pane">
              <div className="output-header">
                  <span>{t.terminalTitle}</span>
                  <span style={{color: isRunning ? 'var(--warning-color)' : '#666'}}>
                      {isRunning ? `● ${t.statusExecuting}` : `● ${t.statusIdle}`}
                  </span>
              </div>

            <div className="console-output">
              {output.length === 0 && !error && <span style={{color:'#888', fontStyle:'italic'}}>{t.waitingOutput}</span>}
              {output.map((line, i) => (
                <div key={i} className="log-line">{line}</div>
              ))}
            </div>

            {/* Error Area */}
            {error && (
              <div className="error-section">
                <div className="error-msg">
                  <strong>⛔ {t.traceback}</strong>
                  <pre style={{marginTop: '5px', whiteSpace: 'pre-wrap'}}>{error}</pre>
                </div>
                
                {!aiExplanation && (
                  <button 
                    className="explain-btn" 
                    onClick={askTutor}
                    disabled={loadingAi}
                  >
                    {loadingAi ? t.analyzing : <><BrainCircuit size={18}/> {t.explainBtn}</>}
                  </button>
                )}

                {aiExplanation && (
                  <div className="ai-response">
                    <strong>🎓 {t.tutorTitle}</strong><br/>
                    <div style={{marginTop: '8px'}}>{aiExplanation}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App