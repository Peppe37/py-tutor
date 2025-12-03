import React from 'react';

const DebugPanel = ({ traceStep }) => {
  if (!traceStep || !traceStep.locals) return null;

  return (
    <div className="debug-panel">
        <div style={{color:'#888', marginBottom:'5px', fontSize:'0.7rem', textTransform:'uppercase'}}>
            Variables @ Line {traceStep.line}
        </div>

        {Object.keys(traceStep.locals).length === 0 ? (
            <span style={{fontStyle:'italic', opacity:0.5}}>No variables</span>
        ) : null}

        {Object.entries(traceStep.locals).map(([key, val]) => (
            <div key={key} className="debug-var-row">
                <span className="var-name">{key}:</span>
                <span className="var-value">{val}</span>
            </div>
        ))}
    </div>
  );
};

export default DebugPanel;