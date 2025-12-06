import os
import pytest
import sys
import importlib
from unittest.mock import MagicMock, patch

def setup_mocks():
    """Ensure server.agent is mocked to prevent side effects."""
    for mod_name in ['server.agent', 'agent']:
        mock_agent_module = MagicMock()
        mock_agent_module.AgentManager.return_value.ask.return_value = "Mock response"
        sys.modules[mod_name] = mock_agent_module

def clean_modules():
    """Remove server modules from sys.modules to force fresh import."""
    modules_to_clean = [
        'server.config', 'server.main', 'server.agent',
        'config', 'main', 'agent'
    ]

    current_modules = list(sys.modules.keys())
    for mod in current_modules:
        if mod in modules_to_clean or mod.startswith('server.'):
            if mod in sys.modules:
                del sys.modules[mod]

    # Also clear server package if present to force re-resolution
    if 'server' in sys.modules:
        del sys.modules['server']

@pytest.fixture(autouse=True)
def clean_env():
    """Ensure environment is clean before and after each test."""
    old_env = os.environ.copy()
    yield
    os.environ.clear()
    os.environ.update(old_env)

def test_debug_default_secure():
    """Test that DEBUG defaults to False if not specified."""
    clean_modules()
    setup_mocks()

    if "DEBUG" in os.environ:
        del os.environ["DEBUG"]

    from server import config
    assert config.DEBUG is False, "DEBUG should default to False"

def test_input_validation_max_length():
    """Test that overly large inputs are rejected."""
    clean_modules()
    setup_mocks()

    from server import main
    from fastapi.testclient import TestClient

    client = TestClient(main.app)

    huge_text = "a" * 60000
    payload = {
        "message": "hello",
        "code": huge_text,
        "error": None,
        "description": "desc",
        "flowchart": "graph",
        "history": []
    }

    response = client.post("/chat", json=payload)
    assert response.status_code == 422

def test_cors_debug_true():
    """Test CORS settings when DEBUG is True."""
    clean_modules()
    setup_mocks()

    os.environ["DEBUG"] = "true"

    # Force import and reload to be absolutely sure
    import server.config
    importlib.reload(server.config)
    import server.main
    importlib.reload(server.main)

    from server import config, main

    assert config.DEBUG is True
    assert "*" in main.origins

def test_cors_debug_false():
    """Test CORS settings when DEBUG is False."""
    clean_modules()
    setup_mocks()

    os.environ["DEBUG"] = "false"

    # Force import and reload
    import server.config
    importlib.reload(server.config)
    import server.main
    importlib.reload(server.main)

    from server import config, main

    assert config.DEBUG is False
    assert "*" not in main.origins
