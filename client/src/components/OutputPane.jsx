import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { StepForward, SkipForward, Square, BrainCircuit, Copy, Check } from 'lucide-react';
import DebugPanel from './DebugPanel';
import './OutputPane.css';

// Componente personalizzato per il tag <pre> (blocchi di codice)
const PreBlock = ({ children, ...props }) => {
  const preRef = React.useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (preRef.current) {
        const text = preRef.current.innerText;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div style={{ position: 'relative', margin: '10px 0' }}>
      <button
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'rgba(255,255,255,0.1)',
          border: 'none',
          borderRadius: '4px',
          padding: '4px',
          cursor: 'pointer',
          color: copied ? 'var(--success-color)' : '#aaa',
          display: 'flex',
          alignItems: 'center',
          zIndex: 5
        }}
        title="Copia codice"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
      <pre ref={preRef} {...props} style={{paddingTop: '30px', overflowX: 'auto'}}>
        {children}
      </pre>
    </div>
  );
};

const OutputPane = ({
  t,
  isDebug,
  isRunning,
  debugTrace,
  currentStep,
  debugPrev,
  debugNext,
  debugContinue,
  debugStop,
  output,
  error,
  cleanTraceback,
  aiExplanation,
  askTutor,
  loadingAi
}) => {

  const displayedError = error ? cleanTraceback(error) : null;

  return (
    <div className="output-pane">
        <div className="output-header">
            <span>{t.terminalTitle}</span>
            <div style={{display:'flex', gap:'15px', alignItems:'center'}}>
              {/* CONTROLLI DEBUGGER */}
              {debugTrace && (
                  <div className="debug-controls">
                      <button className="debug-btn step" onClick={debugPrev} title="Step Back" disabled={currentStep === 0}>
                        <StepForward size={18} style={{transform: 'rotate(180deg)'}}/>
                      </button>
                      <button className="debug-btn step" onClick={debugNext} title="Step Over" disabled={currentStep === debugTrace.length - 1}>
                        <StepForward size={18} />
                      </button>
                      <button className="debug-btn step" onClick={debugContinue} title="Continue to Next Breakpoint">
                        <SkipForward size={18} />
                      </button>
                      <button className="debug-btn stop" onClick={debugStop} title="Stop Debugging">
                        <Square size={16} fill="currentColor"/>
                      </button>
                  </div>
              )}

              {isDebug && !debugTrace && <span style={{color: 'var(--error-color)', fontSize:'0.75rem', fontWeight:'bold'}}>🐞 DEBUG MODE</span>}
              {debugTrace && <span style={{color: 'var(--warning-color)', fontSize:'0.75rem', fontWeight:'bold'}}>STEP {currentStep + 1}/{debugTrace.length}</span>}

              {!debugTrace && (
                <span style={{color: isRunning ? 'var(--warning-color)' : '#666'}}>
                    {isRunning ? `● ${t.statusExecuting}` : `● ${t.statusIdle}`}
                </span>
              )}
            </div>
        </div>

      {debugTrace && debugTrace[currentStep] && (
          <DebugPanel traceStep={debugTrace[currentStep]} />
      )}

      <div className="console-output">
        {output.length === 0 && !error && !debugTrace && <span style={{color:'#888', fontStyle:'italic'}}>{t.waitingOutput}</span>}
        {output.map((line, i) => (
          typeof line === 'object' && line.type === 'image'
          ? <div key={i} className="plot-output"><img src={`data:image/png;base64,${line.content}`} alt="Plot" style={{maxWidth: '100%', borderRadius: '8px', marginTop: '10px'}} /></div>
          : <div key={i} className="log-line">{line}</div>
        ))}
      </div>

      {error && (
        <div className="error-section">
          <div className="error-msg">
            <strong>⛔ {t.traceback}</strong>
            <pre style={{marginTop: '5px', whiteSpace: 'pre-wrap'}}>{displayedError}</pre>
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
            <strong>🎓 {t.tutorTitle}</strong>
            <div className="markdown-body" style={{userSelect: 'text'}}>
                <ReactMarkdown components={{ pre: PreBlock }}>
                    {aiExplanation}
                </ReactMarkdown>
            </div>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default React.memo(OutputPane);