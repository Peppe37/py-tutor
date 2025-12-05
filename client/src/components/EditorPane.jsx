import React, { useMemo } from 'react';
import Editor from '@monaco-editor/react';
import './EditorPane.css';

const EditorPane = ({
  theme,
  code,
  setCode,
  handleEditorDidMount,
  showHints
}) => {

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
       // Monaco doesn't have a direct "mobile mode", but we can tweak settings via props
    }
  };

  return (
    <div className="editor-pane">
      <Editor
        height="100%"
        defaultLanguage="python"
        theme={theme === 'dark' ? "vs-dark" : "light"}
        value={code}
        onChange={setCode}
        onMount={handleEditorDidMount}
        beforeMount={handleEditorWillMount}
        options={editorOptions}
      />
    </div>
  );
};

export default React.memo(EditorPane);