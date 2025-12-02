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
# In produzione su py-test, le richieste arriveranno dallo stesso dominio (tramite proxy)
# o dal dominio specifico.
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

class ExplainRequest(BaseModel):
    code: str
    error_message: str

@app.post("/explain") # Nota: Nginx dovrà mappare /api/explain -> /explain
async def explain_error(req: ExplainRequest):
    user_content = f"Codice:\n```python\n{req.code}\n```\n\nErrore:\n{req.error_message}"
    response = bot.ask(system_prompt=PROMPT, user_text=user_content)
    return {"explanation": response}

if __name__ == "__main__":
    # HOST 0.0.0.0 è NECESSARIO dentro Docker per essere raggiunto da NPM.
    # La sicurezza è garantita dal fatto che NON esporremo la porta nel docker-compose.
    uvicorn.run("main:app", host="0.0.0.0", port=PORT, reload=config.DEBUG)