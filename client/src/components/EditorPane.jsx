import React, { useMemo, useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Copy, ClipboardPaste, Check } from 'lucide-react';
import './EditorPane.css';

const EditorPane = ({
  theme,
  code,
  setCode,
  handleEditorDidMount,
  showHints
}) => {
  const editorRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const editorOptions = useMemo(() => ({
    minimap: { enabled: false },
    fontSize: 16,
    scrollBeyondLastLine: false,
    padding: { top: 20, bottom: 20 },
    automaticLayout: true,
    glyphMargin: true,

    quickSuggestions: showHints,
    suggestOnTriggerCharacters: showHints,
    parameterHints: { enabled: showHints },
    wordBasedSuggestions: showHints,
    hover: { enabled: showHints },

    scrollbar: {
      alwaysConsumeMouseWheel: false,
    }
  }), [showHints]);

  // Mobile optimization for Monaco
  const handleEditorWillMount = (monaco) => {
    // Check if mobile
    if (window.innerWidth < 768) {
       // Disable some heavy features for mobile?
    }
  };

  const handleEditorDidMountWrapper = (editor, monaco) => {
    editorRef.current = editor;
    if (handleEditorDidMount) {
      handleEditorDidMount(editor, monaco);
    }
  };

  const handleCopy = async () => {
    if (!editorRef.current) return;
    const model = editorRef.current.getModel();
    const selection = editorRef.current.getSelection();
    let textToCopy = "";

    if (selection && !selection.isEmpty()) {
       textToCopy = model.getValueInRange(selection);
    } else {
       textToCopy = model.getValue();
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const handlePaste = async () => {
    if (!editorRef.current) return;
    try {
      const text = await navigator.clipboard.readText();
      const selection = editorRef.current.getSelection();
      // Insert text at current cursor position
      editorRef.current.executeEdits("toolbar", [{
        range: selection,
        text: text,
        forceMoveMarkers: true
      }]);
      // Focus back to editor
      editorRef.current.focus();
    } catch (err) {
      console.error('Failed to paste!', err);
      alert("Impossibile incollare. Verifica i permessi del browser.");
    }
  };

  return (
    <div className="editor-pane">
      {/* Mobile Toolbar */}
      <div className="mobile-toolbar">
        <button onClick={handleCopy} className="toolbar-btn" title="Copia">
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </button>
        <button onClick={handlePaste} className="toolbar-btn" title="Incolla">
          <ClipboardPaste size={18} />
        </button>
      </div>

      <Editor
        height="100%"
        defaultLanguage="python"
        theme={theme === 'dark' ? "vs-dark" : "light"}
        value={code}
        onChange={setCode}
        onMount={handleEditorDidMountWrapper}
        beforeMount={handleEditorWillMount}
        options={editorOptions}
      />
    </div>
  );
};

export default React.memo(EditorPane);