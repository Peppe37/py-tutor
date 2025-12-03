import React from 'react';
import { Code, BookOpen, GitGraph } from 'lucide-react';
import './Tabs.css';

const Tabs = ({ activeTab, setActiveTab, t }) => {
  return (
    <div className="tabs-container">
      <button 
        className={`tab-btn ${activeTab === 'code' ? 'active' : ''}`} 
        onClick={() => setActiveTab('code')}
      >
        <Code size={18} /> {t?.tabCode || "Codice"}
      </button>
      
      <button 
        className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`} 
        onClick={() => setActiveTab('description')}
      >
        <BookOpen size={18} /> {t?.tabDesc || "Descrizione & Chat"}
      </button>
      
      <button 
        className={`tab-btn ${activeTab === 'flowchart' ? 'active' : ''}`} 
        onClick={() => setActiveTab('flowchart')}
      >
        <GitGraph size={18} /> {t?.tabFlow || "Flowchart"}
      </button>
    </div>
  );
};

export default Tabs;