// pythonWorker.js
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js");

let pyodide = null;
let sharedBuffer = null;
let sharedBufferInt32 = null;
let sharedBufferUint8 = null;

// Init function
async function loadPyodideEngine() {
  try {
    pyodide = await loadPyodide();
    await pyodide.loadPackage(["micropip"]);

    // Install and activate pyodide-http to patch urllib/requests
    await pyodide.runPythonAsync(`
        import micropip
        await micropip.install('pyodide-http')
        import pyodide_http
        pyodide_http.patch_all()
    `);

    self.postMessage({ type: "READY" });
  } catch (err) {
    self.postMessage({ type: "ERROR", payload: err.message });
  }
}

loadPyodideEngine();

// Helper to handle plotting
self.sendPlot = (data) => {
  self.postMessage({ type: "PLOT", payload: data });
};

// JS function called by Python to get input
self.blockingInput = (prompt) => {
  if (!sharedBufferInt32) {
    return ""; // Fallback if no buffer
  }

  // 1. Send request to main thread
  self.postMessage({ type: "INPUT_REQUEST", payload: prompt || "" });

  // 2. Reset flag to 0
  Atomics.store(sharedBufferInt32, 0, 0);

  // 3. Wait for flag to become 1
  // Atomics.wait(typedArray, index, value) waits until the value at index changes from `value`.
  // So we wait while it is 0.
  Atomics.wait(sharedBufferInt32, 0, 0);

  // 4. Read data
  const len = sharedBufferInt32[1];
  const bytes = sharedBufferUint8.subarray(8, 8 + len);
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
};

const INSTALLER_CODE = `
import ast
import sys
import micropip

async def install_missing_imports(code):
    try:
        tree = ast.parse(code)
    except SyntaxError:
        return

    imports = set()
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for alias in node.names:
                pkg = alias.name.split('.')[0]
                imports.add(pkg)
        elif isinstance(node, ast.ImportFrom):
            if node.module:
                pkg = node.module.split('.')[0]
                imports.add(pkg)

    missing = []
    for pkg in imports:
        try:
            __import__(pkg)
        except ImportError:
            missing.append(pkg)

    if missing:
        print(f"Installing missing packages: {', '.join(missing)}...")
        try:
            await micropip.install(missing)
            print("Installation complete.")
        except Exception as e:
            print(f"Warning: Failed to install some packages: {e}")
`;

// Python setup code to patch matplotlib
const PYTHON_SETUP_CODE = `
import sys
try:
    import matplotlib
    # Set backend to Agg to avoid DOM access
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import io
    import base64
    import js

    def _custom_show():
        # Save figure to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        # Encode to base64
        img_str = base64.b64encode(buf.read()).decode('utf-8')
        # Clear figure
        plt.clf()
        # Send to JS
        js.sendPlot(img_str)

    # Patch plt.show
    plt.show = _custom_show
except ImportError:
    # Matplotlib not installed, skip patching
    pass
    pass

# Patch input() using the JS blocking function
import builtins
import js

def _custom_input(prompt=""):
    return js.blockingInput(prompt)

builtins.input = _custom_input
`;



self.onmessage = async (event) => {
  // Intercept INIT_SHARED_BUFFER before the main handler if possible, 
  // or just handle it inside the main handler.
  // Since we overwrote onmessage, let's merge logic.
  const { type, buffer } = event.data;
  if (type === "INIT_SHARED_BUFFER") {
    sharedBuffer = buffer;
    sharedBufferInt32 = new Int32Array(sharedBuffer);
    sharedBufferUint8 = new Uint8Array(sharedBuffer);
    return;
  }

  // Delegate to original logic for other actions
  handleMessage(event);
};

// Move original onmessage to a named function
const handleMessage = async (event) => {
  const { action, code, packages } = event.data;

  if (!pyodide) {
    self.postMessage({ type: "ERROR", payload: "Pyodide not ready" });
    return;
  }

  try {
    if (action === "run") {
      // Clear previous stdout
      pyodide.setStdout({ batched: (msg) => self.postMessage({ type: "STDOUT", payload: msg }) });

      // We load packages from imports first.
      // This will install matplotlib if the user code imports it.
      await pyodide.loadPackagesFromImports(code);

      // Run auto-installer for packages not covered by loadPackagesFromImports (like seaborn)
      await pyodide.runPythonAsync(INSTALLER_CODE);
      pyodide.globals.set("USER_CODE", code);

      // Pre-configure matplotlib if it's already installed (to avoid backend issues during import checks)
      await pyodide.runPythonAsync(PYTHON_SETUP_CODE);

      await pyodide.runPythonAsync("await install_missing_imports(USER_CODE)");

      // Run setup code (patches matplotlib if present)
      // This is safe because if matplotlib was installed above, it patches it.
      // If not, it catches ImportError and does nothing.
      await pyodide.runPythonAsync(PYTHON_SETUP_CODE);

      await pyodide.runPythonAsync(code);
      self.postMessage({ type: "DONE" });
    }
    else if (action === "debug") {
      pyodide.setStdout({ batched: (msg) => self.postMessage({ type: "STDOUT", payload: msg }) });

      // Ensure packages are loaded for debug trace too
      // Note: loadPackagesFromImports might miss imports inside the stringified code of the debugger,
      // but it's the best we can do without parsing the code manually.
      await pyodide.loadPackagesFromImports(code);

      // Run setup code here too to avoid backend errors if matplotlib is used
      await pyodide.runPythonAsync(PYTHON_SETUP_CODE);

      const result = await pyodide.runPythonAsync(code);
      self.postMessage({ type: "DEBUG_RESULT", payload: result });
    }
    else if (action === "install") {
      const micropip = pyodide.pyimport("micropip");
      await micropip.install(packages);
      self.postMessage({ type: "INSTALLED", payload: packages });
    }
  } catch (err) {
    self.postMessage({ type: "ERROR", payload: err.message });
  }
};
