import { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios';
import './App.css'

// Import Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EditorPane from './components/EditorPane';
import OutputPane from './components/OutputPane';
import Tabs from './components/Tabs';
import DescriptionPane from './components/DescriptionPane';
import FlowchartPane from './components/FlowchartPane';
import InputModal from './components/InputModal';

// Import Utils
import { translations } from './utils/translations';

function App() {
  // --- STATE: TABS & CONTENT ---
  const [activeTab, setActiveTab] = useState('code'); // 'code', 'description', 'flowchart'

  const [code, setCode] = useState("# Write your Python code here\nprint('Hello World!')");
  const codeRef = useRef(code);

  const [description, setDescription] = useState("");
  const [flowchartCode, setFlowchartCode] = useState("graph TD;\n    A[Start] --> B{Errore?};\n    B -- Si --> C[Chiedi AI];\n    B -- No --> D[Festeggia];");
  const [chatHistory, setChatHistory] = useState([]);

  // --- STATE: EXECUTION & AI ---
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  // Removed pyodide state, replaced with worker
  /* Shared Array Buffer for blocking input */
  const [sharedBuffer, setSharedBuffer] = useState(null);
  const [inputRequest, setInputRequest] = useState({ isOpen: false, message: "" });

  const workerRef = useRef(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);

  const [error, setError] = useState(null);
  const [aiExplanation, setAiExplanation] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // --- STATE: UI SETTINGS ---
  const [showHints, setShowHints] = useState(true);
  const [isDebug, setIsDebug] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [savedFiles, setSavedFiles] = useState([]);
  const fileInputRef = useRef(null);

  // --- STATI DEBUGGER ---
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const [breakpoints, setBreakpoints] = useState([]);
  const [debugTrace, setDebugTrace] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const decorationsRef = useRef([]);

  const [theme, setTheme] = useState('dark');
  const [lang, setLang] = useState('it');

  const t = translations[lang];

  // Sincronizza Ref
  useEffect(() => { codeRef.current = code; }, [code]);

  // --- INIZIALIZZAZIONE WORKER PYODIDE ---
  useEffect(() => {
    // Initialize Web Worker
    workerRef.current = new Worker(new URL('./workers/pythonWorker.js', import.meta.url));

    workerRef.current.onmessage = (event) => {
      const { type, payload } = event.data;
      if (type === "READY") {
        setIsWorkerReady(true);
        setOutput(["Ready! 🚀"]);
      } else if (type === "STDOUT") {
        setOutput(prev => [...prev, payload]);
      } else if (type === "PLOT") {
        // Handle plot message (base64 png)
        setOutput(prev => [...prev, { type: 'image', content: payload }]);
      } else if (type === "ERROR") {
        setError(payload);
        setIsRunning(false);
      } else if (type === "INPUT_REQUEST") {
        setInputRequest({ isOpen: true, message: payload });
      } else if (type === "DONE") {
        setIsRunning(false);
      } else if (type === "DEBUG_RESULT") {
        try {
          const trace = JSON.parse(payload);
          if (trace.length > 0) {
            setDebugTrace(trace);
            setCurrentStep(0);
          } else {
            setOutput(prev => [...prev, "Debug finished: No steps recorded."]);
          }
        } catch (e) {
          console.error("JSON Parse error:", e);
          setError("Error parsing debug trace: " + e.message);
        }
        setIsRunning(false);
      }
    };



    // Initialize SharedArrayBuffer for blocking input
    // 1024 bytes should be enough for simple inputs
    // Structure: [flag (int32), length (int32), ...charCodes]
    const sab = new SharedArrayBuffer(1024);
    setSharedBuffer(sab);

    // Send the buffer to the worker (handled in worker init)
    workerRef.current.postMessage({ type: "INIT_SHARED_BUFFER", buffer: sab });

    setOutput(["Loading Python environment..."]);

    // Caricamento preferenze
    const localFiles = localStorage.getItem('pytutor_files');
    if (localFiles) setSavedFiles(JSON.parse(localFiles));

    const savedTheme = localStorage.getItem('pytutor_theme');
    if (savedTheme) setTheme(savedTheme);

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pytutor_theme', theme);
  }, [theme]);

  // --- HELPER PULIZIA ERRORE ---
  const cleanTraceback = useCallback((traceback) => {
    if (isDebug) return traceback;
    if (!traceback) return "";
    const lines = traceback.split('\n');
    const userCodeIndex = lines.findIndex(line => line.includes('File "<exec>"') || line.includes('File "<string>"') || line.includes('File "script.py"'));
    return userCodeIndex === -1 ? traceback : ["Traceback (most recent call last):", ...lines.slice(userCodeIndex)].join('\n');
  }, [isDebug]);

  // --- FUNZIONE CHIAMATA AI UNIFICATA ---
  const callAiAgent = async (userMessage, isFlowchartRequest = false) => {
    setLoadingAi(true);
    const currentCode = codeRef.current;
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010';
    const cleanErr = error ? (isDebug ? error : cleanTraceback(error)) : null;

    // Costruisci il system prompt per guidare l'AI (Guide, don't write)
    const systemInstruction = isFlowchartRequest
      ? "Sei un esperto creatore di diagrammi Mermaid JS."
      : "Sei un tutor di programmazione Python esperto e paziente. Il tuo obiettivo è guidare lo studente verso la soluzione SENZA scrivere il codice completo per lui. Dai suggerimenti, spiega i concetti, e aiuta a ragionare. Usa il codice fornito come contesto. Parla in italiano.";

    try {
      const payload = {
        message: userMessage,
        code: currentCode,
        error: cleanErr,
        description: description,
        flowchart: flowchartCode,
        history: chatHistory,
        system: systemInstruction // Add system instruction if API supports it, otherwise rely on the message prompt
      };

      const response = await axios.post(`${apiUrl}/chat`, payload);
      const reply = response.data.reply;

      if (isFlowchartRequest) {
        // --- PARSING AVANZATO PER MERMAID ---
        let cleanCode = reply;

        // 1. Estrai il contenuto se è in un blocco di codice markdown
        const codeBlockMatch = reply.match(/```(?:mermaid)?([\s\S]*?)```/);
        if (codeBlockMatch && codeBlockMatch[1]) {
          cleanCode = codeBlockMatch[1];
        }

        // 2. Pulisci spazi extra e rimuovi "mermaid" se l'AI l'ha lasciato fuori dal backtick
        cleanCode = cleanCode.trim();
        if (cleanCode.startsWith('mermaid')) {
          cleanCode = cleanCode.replace('mermaid', '').trim();
        }

        // Remove 'graph TD;' if it's repeated
        cleanCode = cleanCode.replace(/^graph TD;?/i, '').trim();

        // 3. Ricostruisci con l'intestazione corretta
        cleanCode = `graph TD;\n${cleanCode}`;

        // 4. Sanitize: Rimuove caratteri pericolosi che rompono il parser
        // (Es. parentesi tonde dentro le etichette non quotate rompono Mermaid)
        // Questa è una regex semplice, per casi complessi servirebbe un parser
        // Ma aiuta a evitare crash banali.

        setFlowchartCode(cleanCode);

        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: "Ho generato un nuovo diagramma di flusso! 📐 Controlla la scheda Flowchart." }
        ]);
        setActiveTab('flowchart');

      } else {
        setChatHistory(prev => [
          ...prev,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: reply }
        ]);
      }
      return reply;

    } catch (err) {
      console.error(err);
      alert(t.alertAiError || "Errore di connessione all'AI.");
      return null;
    } finally {
      setLoadingAi(false);
    }
  };

  const askTutorError = useCallback(async () => {
    if (!error) return;
    setLoadingAi(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8010';
    try {
      const cleanErr = isDebug ? error : cleanTraceback(error);
      const response = await axios.post(`${apiUrl}/chat`, {
        message: "Spiegami questo errore e come risolverlo: " + cleanErr,
        code: codeRef.current,
        error: cleanErr,
        description: description,
        flowchart: flowchartCode,
        history: []
      });
      setAiExplanation(response.data.reply);
    } catch (err) { alert(t.alertAiError); }
    finally { setLoadingAi(false); }
  }, [error, description, flowchartCode, isDebug, cleanTraceback, t]);

  const sendChatMessage = (msg) => {
    callAiAgent(msg, false);
  };

  const askAiToGenerateFlowchart = () => {
    // --- PROMPT RAFFORZATO ---
    // Chiediamo esplicitamente di usare le virgolette per le stringhe
    // Questo previene l'errore della "bomba rossa" causato da parentesi o caratteri speciali fuori dalle virgolette.
    const prompt = `
      Analizza la DESCRIZIONE e il CODICE forniti.
      Genera un grafico Mermaid.js (graph TD) che rappresenti la logica.

      REGOLE RIGIDE PER EVITARE ERRORI DI SINTASSI:
      1. Usa ID semplici per i nodi (es. A, B, C).
      2. IMPORTANTE: Qualsiasi testo dentro un nodo DEVE essere tra virgolette doppie.
         ESEMPIO CORRETTO: A["Leggi input (x)"] --> B{"x > 10?"}
         ESEMPIO ERRATO: A[Leggi input (x)] --> B{x > 10?}
      3. Non usare parentesi tonde () o quadre [] dentro il testo del nodo se non sono tra virgolette.
      4. Rispondi SOLAMENTE con il codice dentro al diagramma, NON includere "graph TD" all'inizio (lo aggiungo io).
      5. Mantieni il diagramma semplice e lineare.
    `;
    callAiAgent(prompt, true);
  };

  // --- GESTIONE EDITOR & BREAKPOINTS ---
  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    editor.onMouseDown((e) => {
      if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
        const lineNumber = e.target.position.lineNumber;
        setBreakpoints(prev => {
          const exists = prev.includes(lineNumber);
          return exists ? prev.filter(l => l !== lineNumber) : [...prev, lineNumber];
        });
      }
    });
  }, []);

  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    const newDecorations = [];
    breakpoints.forEach(line => {
      newDecorations.push({
        range: new monacoRef.current.Range(line, 1, line, 1),
        options: { isWholeLine: false, glyphMarginClassName: 'codicon-breakpoint' }
      });
    });
    if (debugTrace && debugTrace[currentStep]) {
      const currentLine = debugTrace[currentStep].line;
      newDecorations.push({
        range: new monacoRef.current.Range(currentLine, 1, currentLine, 1),
        options: { isWholeLine: true, className: 'debug-current-line' }
      });
      editorRef.current.revealLineInCenter(currentLine);
    }
    decorationsRef.current = editorRef.current.deltaDecorations(decorationsRef.current, newDecorations);
  }, [breakpoints, currentStep, debugTrace]);

  // --- ESECUZIONE NORMALE ---
  const runCode = useCallback(() => {
    if (!isWorkerReady || !workerRef.current) return;
    setIsRunning(true);
    setDebugTrace(null);
    setError(null);
    setAiExplanation(null);
    setOutput([]);

    workerRef.current.postMessage({
      action: 'run',
      code: codeRef.current
    });
  }, [isWorkerReady]);

  // --- ESECUZIONE DEBUG (TRACING) ---
  const runDebug = useCallback(() => {
    if (!isWorkerReady || !workerRef.current) return;
    setIsRunning(true);
    setError(null);
    setAiExplanation(null);
    setOutput([]);
    setDebugTrace(null);
    const currentCode = codeRef.current;

    const tracerCode = `
import sys
import json
trace_data = []
def trace_calls(frame, event, arg):
    if event != 'line': return trace_calls
    if frame.f_code.co_name == "<module>" or frame.f_code.co_filename == "<string>":
        local_vars = {}
        for k, v in frame.f_locals.items():
            if not k.startswith('__'):
                try: local_vars[k] = repr(v)
                except: local_vars[k] = "<error>"
        trace_data.append({ "line": frame.f_lineno, "locals": local_vars, "event": "line" })
    return trace_calls
user_code = ${JSON.stringify(currentCode)}
sys.settrace(trace_calls)
try: exec(user_code, {})
except Exception as e: trace_data.append({"line": -1, "event": "exception", "message": str(e)})
finally: sys.settrace(None)
json.dumps(trace_data)
`;
    workerRef.current.postMessage({
      action: 'debug',
      code: tracerCode
    });
  }, [isWorkerReady]);

  const debugNext = useCallback(() => { if (debugTrace && currentStep < debugTrace.length - 1) setCurrentStep(prev => prev + 1); }, [debugTrace, currentStep]);
  const debugPrev = useCallback(() => { if (debugTrace && currentStep > 0) setCurrentStep(prev => prev - 1); }, [debugTrace, currentStep]);
  const debugContinue = useCallback(() => { if (!debugTrace) return; const nextBpIndex = debugTrace.findIndex((step, index) => index > currentStep && breakpoints.includes(step.line)); setCurrentStep(nextBpIndex !== -1 ? nextBpIndex : debugTrace.length - 1); }, [debugTrace, currentStep, breakpoints]);
  const debugStop = useCallback(() => { setDebugTrace(null); setCurrentStep(0); }, []);

  // --- ALTRE FUNZIONI UI ---
  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
  const toggleLang = useCallback(() => setLang(prev => prev === 'it' ? 'en' : 'it'), []);

  const handleSave = useCallback(() => {
    const currentCode = codeRef.current;
    const filename = prompt(t.promptSave, "script.py"); if (!filename) return;
    const newFile = { id: Date.now(), name: filename.endsWith('.py') ? filename : `${filename}.py`, content: currentCode, date: new Date().toLocaleDateString() };
    setSavedFiles(prev => { const updated = [...prev, newFile]; localStorage.setItem('pytutor_files', JSON.stringify(updated)); return updated; });
    setIsSidebarOpen(true);
  }, [t]);

  const handleDownload = useCallback(() => { const currentCode = codeRef.current; const filename = prompt(t.promptDownload, "main.py"); if (!filename) return; const blob = new Blob([currentCode], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); }, [t]);

  const handleImportClick = useCallback(() => fileInputRef.current.click(), []);
  const handleFileChange = useCallback((e) => { const file = e.target.files[0]; if (!file) return; const r = new FileReader(); r.onload = ev => { setCode(ev.target.result); setIsSidebarOpen(false) }; r.readAsText(file); e.target.value = null; }, []);
  const loadSavedFile = useCallback((content) => { if (confirm(t.confirmOverride)) { setCode(content); if (window.innerWidth < 768) setIsSidebarOpen(false); } }, [t]);
  const deleteSavedFile = useCallback((e, id) => { e.stopPropagation(); if (confirm(t.confirmDelete)) { setSavedFiles(prev => { const u = prev.filter(f => f.id !== id); localStorage.setItem('pytutor_files', JSON.stringify(u)); return u; }); } }, [t]);

  return (
    <div className="main-layout">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        savedFiles={savedFiles}
        loadSavedFile={loadSavedFile}
        deleteSavedFile={deleteSavedFile}
        handleImportClick={handleImportClick}
        fileInputRef={fileInputRef}
        handleFileChange={handleFileChange}
        t={t}
        // Mobile Actions Props
        toggleTheme={toggleTheme}
        theme={theme}
        toggleLang={toggleLang}
        lang={lang}
        handleSave={handleSave}
        handleDownload={handleDownload}
      />

      <div className="main-content">
        <Header
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          toggleLang={toggleLang}
          lang={lang}
          toggleTheme={toggleTheme}
          theme={theme}
          handleSave={handleSave}
          handleDownload={handleDownload}
          showHints={showHints}
          setShowHints={setShowHints}
          isDebug={isDebug}
          setIsDebug={setIsDebug}
          setDebugTrace={setDebugTrace}
          runCode={runCode}
          runDebug={runDebug}
          pyodide={isWorkerReady}
          isRunning={isRunning}
          t={t}
        />

        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} t={t} />

        <div className="container">

          {/* TAB 1: CODICE (Editor + Output) */}
          <div style={{ display: activeTab === 'code' ? 'flex' : 'none', flexDirection: 'column', flex: 1, gap: '20px' }}>
            <EditorPane
              theme={theme}
              code={code}
              setCode={setCode}
              handleEditorDidMount={handleEditorDidMount}
              showHints={showHints}
            />
            <OutputPane
              t={t}
              isDebug={isDebug}
              isRunning={isRunning}
              debugTrace={debugTrace}
              currentStep={currentStep}
              debugPrev={debugPrev}
              debugNext={debugNext}
              debugContinue={debugContinue}
              debugStop={debugStop}
              output={output}
              error={error}
              cleanTraceback={cleanTraceback}
              aiExplanation={aiExplanation}
              askTutor={askTutorError}
              loadingAi={loadingAi}
            />
          </div>

          {/* TAB 2: DESCRIZIONE & CHAT */}
          <div style={{ display: activeTab === 'description' ? 'flex' : 'none', flex: 1 }}>
            <DescriptionPane
              description={description}
              setDescription={setDescription}
              chatHistory={chatHistory}
              sendChatMessage={sendChatMessage}
              isAiLoading={loadingAi}
              t={t}
            />
          </div>

          {/* TAB 3: FLOWCHART */}
          <div style={{ display: activeTab === 'flowchart' ? 'flex' : 'none', flex: 1 }}>
            <FlowchartPane
              flowchartCode={flowchartCode}
              setFlowchartCode={setFlowchartCode}
              askAiToGenerateFlowchart={askAiToGenerateFlowchart}
              isAiLoading={loadingAi}
              theme={theme}
            />
          </div>

        </div>
      </div>


      <InputModal
        isOpen={inputRequest.isOpen}
        message={inputRequest.message}
        onSubmit={(value) => {
          if (!sharedBuffer || !workerRef.current) return;

          const int32View = new Int32Array(sharedBuffer);
          const encoded = new TextEncoder().encode(value);

          // Write content to buffer skipping first 8 bytes (flag + length)
          // We limit input to buffer size - 8
          const maxBytes = sharedBuffer.byteLength - 8;
          const bytesToWrite = encoded.slice(0, maxBytes);

          const uint8View = new Uint8Array(sharedBuffer);
          uint8View.set(bytesToWrite, 8);

          // Set length
          int32View[1] = bytesToWrite.length;

          // Set flag to 1 (DATA_READY)
          Atomics.store(int32View, 0, 1);

          // Notify the worker
          Atomics.notify(int32View, 0);

          setInputRequest({ isOpen: false, message: "" });
        }}
      />
    </div >
  )
}

export default App