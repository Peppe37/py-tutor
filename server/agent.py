from ollama import Client, ResponseError, RequestError
import config

class AgentManager:
    def __init__(self):
        self.client = Client(
            host=config.OLLAMA_ENDPOINT,
        )
        self.model = config.OLLAMA_MODEL

    def ask(self, system_prompt: str = None, user_text: str = None, messages: list = None) -> str:
        """
        messages: lista di dict {role: 'user'|'assistant'|'system', content: str}.
        Se passata, viene usata direttamente.
        Altrimenti viene costruita dai parametri system_prompt + user_text.
        """
        if messages is None:
            messages = []
            if system_prompt:
                messages.append({"role": "system", "content": system_prompt})
            if user_text:
                messages.append({"role": "user", "content": user_text})

        if not messages:
            return "Errore: nessun messaggio da inviare."

        try:
            response = self.client.chat(model=self.model, messages=messages)
            content = response.get('message', {}).get('content', '')
            if not content:
                return f"Errore: message.content vuoto: {response!r}"
            return content.strip()

        except RequestError:
            return f"Errore di connessione: impossibile raggiungere Ollama all'indirizzo {self.client._host}. Assicurati che il servizio sia attivo."
        except ResponseError as e:
            return f"Errore da Ollama: {e.error}"
        except Exception as e:
            return f"Errore durante la richiesta a Ollama: {e}"
