import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { RefreshCw, Wand2 } from 'lucide-react';
import './FlowchartPane.css';

// Inizializza mermaid
mermaid.initialize({
  startOnLoad: true,
  theme: 'dark',
  securityLevel: 'loose',
});

const FlowchartPane = ({
  flowchartCode,
  setFlowchartCode,
  askAiToGenerateFlowchart,
  isAiLoading,
  theme
}) => {
  const chartRef = useRef(null);
  const [svgContent, setSvgContent] = useState('');
  const [renderError, setRenderError] = useState(null);

  // Re-render del grafico quando cambia il codice
  useEffect(() => {
    const renderChart = async () => {
      if (!flowchartCode) return;
      try {
        setRenderError(null);
        // Usa un ID univoco per evitare conflitti
        const { svg } = await mermaid.render('mermaid-chart', flowchartCode);
        setSvgContent(svg);
      } catch (error) {
        console.error("Mermaid Error:", error);
        setRenderError("Errore di sintassi nel grafico. Controlla il codice.");
      }
    };

    // Imposta il tema corretto prima di renderizzare
    mermaid.initialize({
        startOnLoad: true,
        theme: theme === 'dark' ? 'dark' : 'default',
    });

    renderChart();
  }, [flowchartCode, theme]);

  return (
    <div className="flow-pane-layout">
      {/* EDITOR */}
      <div className="flow-editor">
        <div className="section-title">
            <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
                📐 Editor Mermaid
                <button
                    className="ai-gen-btn"
                    onClick={askAiToGenerateFlowchart}
                    disabled={isAiLoading}
                    title="Chiedi all'AI di generare il grafico dalla descrizione"
                >
                    <Wand2 size={14} /> AI Auto-Generate
                </button>
            </div>
        </div>
        <textarea
          value={flowchartCode}
          onChange={(e) => setFlowchartCode(e.target.value)}
          placeholder="graph TD; A-->B;"
          spellCheck="false"
        />
      </div>

      {/* PREVIEW */}
      <div className="flow-preview">
        <div className="section-title">👁️ Anteprima</div>
        <div className="preview-container">
            {renderError ? (
                <div className="render-error">{renderError}</div>
            ) : (
                <div
                    ref={chartRef}
                    className="mermaid-output"
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default FlowchartPane;