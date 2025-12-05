import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User, Copy, Check } from 'lucide-react'; // Aggiungi Copy, Check
import './DescriptionPane.css';

// Componente personalizzato per i blocchi di codice con tasto copia
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const textToCopy = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline) {
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
        <pre className={className} {...props} style={{paddingTop: '30px', overflowX: 'auto'}}>
          <code>{children}</code>
        </pre>
      </div>
    );
  }
  return <code className={className} {...props}>{children}</code>;
};

const DescriptionPane = ({
  description,
  setDescription,
  chatHistory,
  sendChatMessage,
  isAiLoading,
  t
}) => {
  const [inputMsg, setInputMsg] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, isAiLoading]);

  const handleSend = () => {
    if (!inputMsg.trim()) return;
    sendChatMessage(inputMsg);
    setInputMsg("");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="desc-pane-layout">
      {/* SEZIONE SINISTRA: TRACCIA */}
      <div className="desc-section">
        <div className="section-title">
            📝 {t?.descTitle || "Traccia Esercizio"}
        </div>
        <textarea
          className="desc-textarea"
          placeholder="Scrivi qui la traccia del problema o i tuoi appunti..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      {/* SEZIONE DESTRA: CHAT */}
      <div className="chat-section">
        <div className="section-title">
            💬 {t?.chatTitle || "Tutor Chat"}
        </div>

        <div className="chat-history">
          {chatHistory.length === 0 && (
            <div className="empty-chat">
                Chiedimi aiuto sul codice, sulla logica o per generare un flowchart!
            </div>
          )}

          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`chat-msg ${msg.role}`}>
              <div className="msg-avatar">
                {msg.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
              </div>
              <div className="msg-content markdown-body" style={{userSelect: 'text'}}> {/* Abilita selezione */}
                {msg.role === 'user' ? (
                   msg.content
                ) : (
                   <ReactMarkdown
                      components={{ code: CodeBlock }} // Usa il componente custom
                   >
                      {msg.content}
                   </ReactMarkdown>
                )}
              </div>
            </div>
          ))}

          {isAiLoading && (
            <div className="chat-msg assistant">
               <div className="msg-avatar"><Bot size={16}/></div>
               <div className="msg-content typing">Sta scrivendo...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <textarea
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Fai una domanda al Professore..."
            rows={1}
          />
          <button className="send-btn icon-btn" onClick={handleSend} disabled={isAiLoading} style={{width:'40px', height:'40px'}}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionPane;