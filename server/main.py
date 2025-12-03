import uvicorn
import os
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import config
from agent import AgentManager
from prompt import PROMPT

# Prende la porta dalle Env o usa 8010 di default
PORT = int(os.getenv("PORT", 8010))

app = FastAPI(debug=config.DEBUG)

# Gestione CORS
origins = ["*"] if config.DEBUG else [
    "https://py-test.printingarage.it",
    "http://py-test.printingarage.it"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inizializzazione Agente
try:
    bot = AgentManager()
    print(f"✅ Agente attivo su porta {PORT} | Modello: {config.OLLAMA_MODEL}")
except Exception as e:
    print(f"❌ Errore Agente: {e}")

# Nuovo Modello di Richiesta Completa
class ChatRequest(BaseModel):
    message: str          # La domanda dell'utente (o "Spiegami l'errore")
    code: str             # Il codice nell'editor
    error: str | None     # L'errore in console (opzionale)
    description: str      # La traccia dell'esercizio
    flowchart: str        # Il codice del grafico mermaid
    history: list         # Cronologia chat (opzionale, per il futuro)

@app.post("/chat")
async def chat_tutor(req: ChatRequest):
    # Costruiamo il contesto per il System Prompt in modo dinamico
    context_info = f"""
    --- CONTESTO STUDENTE ---
    CODICE ATTUALE:
    ```python
    {req.code}
    ```

    ERRORE RILEVATO (Se presente):
    {req.error if req.error else "Nessun errore al momento."}

    DESCRIZIONE ESERCIZIO:
    {req.description if req.description else "Nessuna traccia fornita."}

    FLOWCHART CORRENTE (Mermaid):
    {req.flowchart}
    -------------------------
    """

    # Uniamo il prompt di sistema base con il contesto attuale
    full_system_prompt = PROMPT + "\n" + context_info

    # Chiediamo all'agente
    response = bot.ask(system_prompt=full_system_prompt, user_text=req.message)

    return {"reply": response}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=config.DEBUG)