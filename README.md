🐍 PyTutor - AI-Powered Python Learning Environment
===================================================

**PyTutor** è un ambiente di sviluppo (IDE) interattivo basato sul web progettato per l'apprendimento del linguaggio Python. A differenza dei classici editor, PyTutor integra un **Tutor AI Socratico** che, invece di fornire la soluzione agli errori, guida lo studente verso la comprensione del problema attraverso suggerimenti e spiegazioni concettuali.

Il codice Python viene eseguito interamente nel browser grazie a **Pyodide** (WebAssembly), garantendo velocità e sicurezza, mentre l'AI è gestita da un backend leggero che protegge le API Key.

✨ Funzionalità Principali
-------------------------

*   **⚡ Esecuzione Client-Side:** Compilazione ed esecuzione Python direttamente nel browser tramite Pyodide.
    
*   **🤖 AI Tutor Socratico:** Analisi intelligente degli errori (Traceback) che spiega il "perché" senza spoilerare la soluzione.
    
*   **🎨 Editor Professionale:** Basato su Monaco Editor (VS Code engine) con syntax highlighting e IntelliSense.
    
*   **📂 File System Locale:** Salvataggio file nel LocalStorage del browser, Download .py e Importazione file locali.
    
*   **🌗 UI Moderna:** Interfaccia Responsive, Tema Chiaro/Scuro e supporto multilingua (IT/EN).
    
*   **🔒 Privacy:** Nessun codice utente viene salvato sui server (solo l'errore viene inviato all'AI per l'analisi).
    

🛠️ Tech Stack
--------------

### Frontend

*   **React 18** + **Vite**
    
*   **Pyodide** (Python WebAssembly)
    
*   **Monaco Editor**
    
*   **Lucide React** (Icone)
    
*   **Axios**
    

### Backend (AI Proxy)

*   **Python 3.11**
    
*   **FastAPI**
    
*   **Ollama** / **OpenAI** (Configurabile)
    
*   **Docker** + **Nginx** (Produzione)
    

🚀 Installazione e Sviluppo
---------------------------

### Prerequisiti

*   Node.js 18+
    
*   Python 3.11+
    
*   Docker (opzionale, per produzione)
    

### 1\. Setup Locale (Sviluppo)

Clona la repository:

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   git clone [https://github.com/Peppe37/py-tutor.git](https://github.com/Peppe37/py-tutor.git)  cd py-tutor   `

**Terminale 1: Backend**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cd server  pip install -r requirements.txt  # Crea un file .env basato su .env.example  cp .env.example .env  # Avvia il server  python main.py   `

**Terminale 2: Frontend**

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   cd client  npm install  # Crea .env locale  echo "VITE_API_URL=http://localhost:8010" > .env.development  # Avvia React  npm run dev   `

Visita http://localhost:5173.

### 2\. Deploy in Produzione (Docker)

Per avviare l'intera stack su un server VPS:

1.  Configura il file server/.env con le tue chiavi di produzione.
    
2.  Esegui:
    

Plain textANTLR4BashCC#CSSCoffeeScriptCMakeDartDjangoDockerEJSErlangGitGoGraphQLGroovyHTMLJavaJavaScriptJSONJSXKotlinLaTeXLessLuaMakefileMarkdownMATLABMarkupObjective-CPerlPHPPowerShell.propertiesProtocol BuffersPythonRRubySass (Sass)Sass (Scss)SchemeSQLShellSwiftSVGTSXTypeScriptWebAssemblyYAMLXML`   docker compose up -d --build   `

Il servizio sarà esposto internamente. Utilizzare un Reverse Proxy (come Nginx Proxy Manager) per esporre il frontend sulla porta 80/443.

⚖️ Licenza, Termini e Citazioni
-------------------------------

Questo progetto è distribuito sotto licenza **MIT**.

### Condizioni di Utilizzo

La licenza MIT permette l'utilizzo commerciale, la modifica e la distribuzione del software. Tuttavia, per rispetto del lavoro svolto e come condizione etica di utilizzo di questo open source:

1.  **Attribuzione Obbligatoria:** Se utilizzi questo codice (o parti sostanziali di esso) in progetti personali, accademici o commerciali, **devi mantenere il file LICENSE originale** includendo il copyright di Giuseppe Lapietra.
    
2.  _"Powered by PyTutor Core developed by Giuseppe Lapietra"_
    

La rimozione delle intestazioni di copyright dal codice sorgente costituisce una violazione della licenza.

🤝 Contribuire
--------------

I contributi sono benvenuti! Per modifiche maggiori, per favore apri prima una Issue per discutere cosa vorresti cambiare.

1.  Forka il progetto
    
2.  Crea il tuo branch delle feature (git checkout -b feature/AmazingFeature)
    
3.  Committa i tuoi cambiamenti (git commit -m 'Add some AmazingFeature')
    
4.  Pusha sul branch (git push origin feature/AmazingFeature)
    
5.  Apri una Pull Request
    

📞 Contatti
-----------

**Giuseppe Lapietra**

*   📧 Email: lapietra.giu@gmail.com
    
*   🐙 GitHub: [@Peppe37](https://github.com/Peppe37)
    

_Created with ❤️ & Python._
