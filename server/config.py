from dotenv import load_dotenv
import os

load_dotenv()

# Funzione helper per convertire stringhe in booleani
def str_to_bool(value):
    return str(value).lower() in ('true', '1', 't', 'yes', 'y')

OLLAMA_ENDPOINT = os.getenv("OLLAMA_ENDPOINT", "http://localhost:11434")
OLLAMA_API_KEY = os.getenv("OLLAMA_API_KEY", "")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "qwen3-coder:480b-cloud")

# Convertiamo la stringa "true"/"false" in vero booleano Python
DEBUG = str_to_bool(os.getenv("DEBUG", "false"))

PORT = os.getenv("PORT", "8010")