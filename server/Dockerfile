# Usa Python leggero
FROM python:3.11-slim

# Evita di scrivere file .pyc e bufferizza i log
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Installa dipendenze
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia il codice
COPY . .

# Crea un utente non-root per sicurezza
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

# Espone la porta interna (non accessibile da internet, solo dalla rete Docker)
EXPOSE 8010

# Avvia Uvicorn sulla porta 8010
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8010"]