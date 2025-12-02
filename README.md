![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Python](https://img.shields.io/badge/Backend-FastAPI-green)
![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED)
![Status](https://img.shields.io/badge/Status-Active%20Development-success)

# **🐍 PyTutor \- AI-Powered Python Learning Environment**

**PyTutor** is a web-based interactive development environment (IDE) designed for learning Python. Unlike classic editors, PyTutor integrates a **Socratic AI Tutor** which, instead of providing the solution to errors, guides the student towards understanding the problem through hints and conceptual explanations.

Python code is executed entirely in the browser thanks to **Pyodide** (WebAssembly), ensuring speed and security, while the AI is managed by a lightweight backend that protects API Keys.

## **✨ Key Features**

* **⚡ Client-Side Execution:** Python compilation and execution directly in the browser via Pyodide.  
* **🤖 Socratic AI Tutor:** Intelligent error analysis (Traceback) that explains "why" without spoiling the solution.  
* **🎨 Professional Editor:** Based on Monaco Editor (VS Code engine) with syntax highlighting and IntelliSense.  
* **📂 Local File System:** Save files to browser LocalStorage, Download .py files, and Import local files.  
* **🌗 Modern UI:** Responsive Interface, Light/Dark Theme, and Multi-language support (IT/EN).  
* **🔒 Privacy:** No user code is saved on servers (only the error trace is sent to AI for analysis).

## **🛠️ Tech Stack**

### **Frontend**

* **React 18** \+ **Vite**  
* **Pyodide** (Python WebAssembly)  
* **Monaco Editor**  
* **Lucide React** (Icons)  
* **Axios**

### **Backend (AI Proxy)**

* **Python 3.11**  
* **FastAPI**  
* **Ollama** / **OpenAI** (Configurable)  
* **Docker** \+ **Nginx** (Production)

## **🚀 Installation & Development**

### **Prerequisites**

* Node.js 18+  
* Python 3.11+  
* Docker (optional, for production)

### **1\. Local Setup (Development)**

Clone the repository:

git clone \[https://github.com/Peppe37/py-tutor.git\](https://github.com/Peppe37/py-tutor.git)  
cd py-tutor

**Terminal 1: Backend**

cd server  
pip install \-r requirements.txt  
\# Create a .env file based on .env.example  
cp .env.example .env  
\# Start the server  
python main.py

**Terminal 2: Frontend**

cd client  
npm install  
\# Create local .env  
echo "VITE\_API\_URL=http://localhost:8010" \> .env.development  
\# Start React  
npm run dev

Visit http://localhost:5173.

### **2\. Production Deploy (Docker)**

To start the entire stack on a VPS server:

1. Configure the server/.env file with your production keys.  
2. Run:

docker compose up \-d \--build

The service will be exposed internally. Use a Reverse Proxy (like Nginx Proxy Manager) to expose the frontend on port 80/443.

## **⚖️ License, Terms, and Citations**

This project is distributed under the **MIT** license.

### **Terms of Use**

The MIT license allows commercial use, modification, and distribution of the software. However, out of respect for the work done and as an ethical condition for using this open source project:

1. **Mandatory Attribution:** If you use this code (or substantial parts of it) in personal, academic, or commercial projects, **you must maintain the original LICENSE file** including the copyright of Giuseppe Lapietra.  
2. **Visible Citation:** If the project is used for commercial purposes or published online, a visible citation (e.g., in the footer or "Credits" page) with a link to this repository is appreciated:*"Powered by PyTutor Core developed by Giuseppe Lapietra"*

Removing copyright headers from the source code constitutes a violation of the license.

## **🤝 Contributing**

Contributions are welcome\! For major changes, please open an Issue first to discuss what you would like to change.

1. Fork the project  
2. Create your feature branch (git checkout \-b feature/AmazingFeature)  
3. Commit your changes (git commit \-m 'Add some AmazingFeature')  
4. Push to the branch (git push origin feature/AmazingFeature)  
5. Open a Pull Request

## **📞 Contacts**

**Giuseppe Lapietra**

* 📧 Email: lapietra.giu@gmail.com  
* 🐙 GitHub: [@Peppe37](https://github.com/Peppe37)

*Created with ❤️ & Python.*
