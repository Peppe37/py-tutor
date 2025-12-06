# SECURITY.md

## Security Posture

This document outlines the security measures and testing procedures for the application.

### Backend Hardening
- **Debug Mode**: The application defaults to `DEBUG=False` in `server/config.py`. This prevents sensitive information (like stack traces) from being exposed in production.
- **Input Validation**: The `ChatRequest` model in `server/main.py` enforces maximum lengths for all text fields to mitigate Denial of Service (DoS) attacks via memory exhaustion.
- **CORS Configuration**: Cross-Origin Resource Sharing (CORS) is restricted to specific trusted domains when `DEBUG` is disabled.
- **Prompt Injection**: While the system uses an LLM, the backend code treats user input as potentially untrusted.

### Security Tests
Security tests are located in `server/tests/test_security.py`. They verify:
1. `DEBUG` defaults to `False`.
2. Overly large inputs result in a `422 Unprocessable Entity` error.
3. CORS headers are restricted in production mode.

To run the security tests:
```bash
# Ensure dependencies are installed
pip install -r server/requirements.txt

# Run tests
export PYTHONPATH=$PYTHONPATH:$(pwd)/server
pytest server/tests/test_security.py
```

### Dependencies
- **Server**: Minimal dependencies (`fastapi`, `uvicorn`, `pydantic`, `ollama`) kept up to date.
- **Client**: React application using `react-markdown`. Note: `rehype-raw` is NOT used, ensuring HTML escaping by default to prevent XSS.

### Reporting Vulnerabilities
If you find a security issue, please report it to the maintainers privately.
