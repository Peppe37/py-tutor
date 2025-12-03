import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Send, Bot, User } from 'lucide-react';
import './DescriptionPane.css';

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

  // Auto-scroll alla fine della chat
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
      {/* SEZIONE SINISTRA: TRACCIA/DESCRIZIONE */}
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

      {/* SEZIONE DESTRA: CHAT TUTOR */}
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
              <div className="msg-content markdown-body">
                {/* Se è user usa testo semplice, se è bot usa markdown */}
                {msg.role === 'user' ? msg.content : <ReactMarkdown>{msg.content}</ReactMarkdown>}
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
          <button className="send-btn" onClick={handleSend} disabled={isAiLoading}>
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DescriptionPane;