// pythonWorker.js
importScripts("https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js");

let pyodide = null;

// Init function
async function loadPyodideEngine() {
  try {
    pyodide = await loadPyodide();
    await pyodide.loadPackage(["micropip"]);
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
`;

self.onmessage = async (event) => {
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
