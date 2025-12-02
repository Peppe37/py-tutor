![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-blue)
![Python](https://img.shields.io/badge/Backend-FastAPI-green)
![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED)
![Status](https://img.shields.io/badge/Status-Active%20Development-success)

# 🐍 PyTutor - AI-Powered Python Learning Environment

__PyTutor__ is a web-based interactive development environment (IDE) designed for learning Python. Unlike classic editors, PyTutor integrates a __Socratic AI Tutor__ which, instead of providing the solution to errors, guides the student towards understanding the problem through hints and conceptual explanations.

Python code is executed entirely in the browser thanks to __Pyodide__ (WebAssembly), ensuring speed and security, while the AI is managed by a lightweight backend that protects API Keys.

## ✨ Key Features

- __⚡ Client-Side Execution:__ Python compilation and execution directly in the browser via Pyodide.
- __🤖 Socratic AI Tutor:__ Intelligent error analysis (Traceback) that explains "why" without spoiling the solution.
- __🎨 Professional Editor:__ Based on Monaco Editor (VS Code engine) with syntax highlighting and IntelliSense.
- __📂 Local File System:__ Save files to browser LocalStorage, Download .py files, and Import local files.
- __🌗 Modern UI:__ Responsive Interface, Light/Dark Theme, and Multi-language support (IT/EN).
- __🔒 Privacy:__ No user code is saved on servers (only the error trace is sent to AI for analysis).

## 🛠️ Tech Stack

### Frontend

- __React 18__ + __Vite__
- __Pyodide__ (Python WebAssembly)
- __Monaco Editor__
- __Lucide React__ (Icons)
- __Axios__

### Backend (AI Proxy)

- __Python 3.11__
- __FastAPI__
- __Ollama__ / __OpenAI__ (Configurable)
- __Docker__ + __Nginx__ (Production)

## 🚀 Installation & Development

### Prerequisites

- Node.js 18+
- Python 3.11+
- Docker (optional, for production)

### Local Setup (Development)

Clone the repository:

```bash
git clone https://github.com/Peppe37/py-tutor
cd py-tutor
```

__Terminal 1: Backend__

```bash
cd server
pip install -r requirements.txt
```

# Create a .env file based on .env.example

```bash
cp .env.example .env
```

# Start the server

```bash
python main.py
```

__Terminal 2: Frontend__

```bash
cd client
npm install
```

# Create local .env

```bash
echo "VITE_API_URL=http://localhost:8010" > .env.development
```

# Start React

```bash
npm run dev
```

Visit http://localhost:5173.

### __Production Deploy (Docker)__

To start the entire stack on a VPS server:

1. Configure the `server/.env` file with your production keys.
1. Run:

    ```bash
    docker compose up -d --build
    ```

The service will be exposed internally. Use a Reverse Proxy (like Nginx Proxy Manager) to expose the frontend on port 80/443.

## ⚖️ License, Terms, and Citations

This project is distributed under the __MIT__ license.

### Terms of Use

The MIT license allows commercial use, modification, and distribution of the software. However, out of respect for the work done and as an ethical condition for using this open source project:

1. __Mandatory Attribution:__ If you use this code (or substantial parts of it) in personal, academic, or commercial projects, __you must maintain the original LICENSE file__ including the copyright of Giuseppe Lapietra.
1. __Visible Citation:__ If the project is used for commercial purposes or published online, a visible citation (e.g., in the footer or "Credits" page) with a link to this repository is appreciated:_"Powered by PyTutor Core developed by Giuseppe Lapietra"_

Removing copyright headers from the source code constitutes a violation of the license.

## __🤝 Contributing__

Contributions are welcome! For major changes, please open an Issue first to discuss what you would like to change.

1. Fork the project
1. Create your feature branch (`git checkout -b feature/AmazingFeature`)
1. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
1. Push to the branch (`git push origin feature/AmazingFeature`)
1. Open a Pull Request

## __📞 Contacts__

__Giuseppe Lapietra__

- 📧 Email: lapietra.giu@gmail.com
- 🐙 GitHub: [@Peppe37](https://github.com/Peppe37)

_Created with ❤️ & Python._
