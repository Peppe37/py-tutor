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

// Helper to monkey-patch matplotlib
// We define a python function `__show_plot_in_worker` and assign it to `plt.show`
const MATPLOTLIB_PATCH = `
import matplotlib
import matplotlib.pyplot as plt
import io
import base64
from js import post_plot_to_worker

# Set backend to Agg (non-interactive) to avoid GUI errors
matplotlib.use("Agg")

def show_patched(*args, **kwargs):
    buf = io.BytesIO()
    plt.savefig(buf, format='png')
    buf.seek(0)
    img_str = base64.b64encode(buf.read()).decode('utf-8')
    post_plot_to_worker(img_str)
    plt.clf()
    buf.close()

# Patch
plt.show = show_patched
`;

self.post_plot_to_worker = (base64Str) => {
  self.postMessage({ type: "PLOT", payload: base64Str });
};

self.onmessage = async (event) => {
  const { action, code, packages } = event.data;

  if (!pyodide) {
    self.postMessage({ type: "ERROR", payload: "Pyodide not ready" });
    return;
  }

  try {
    if (action === "run") {
      pyodide.setStdout({ batched: (msg) => self.postMessage({ type: "STDOUT", payload: msg }) });

      // Auto-load packages (including matplotlib if detected)
      await pyodide.loadPackagesFromImports(code);

      // Check if matplotlib is used, if so, apply patch
      if (code.includes("matplotlib") || code.includes("plt.")) {
        try {
            // Ensure matplotlib is loaded before patching
            await pyodide.loadPackage("matplotlib");
            await pyodide.runPythonAsync(MATPLOTLIB_PATCH);
        } catch (e) {
            console.warn("Could not patch matplotlib:", e);
        }
      }

      await pyodide.runPythonAsync(code);
      self.postMessage({ type: "DONE" });
    }
    else if (action === "debug") {
       pyodide.setStdout({ batched: (msg) => self.postMessage({ type: "STDOUT", payload: msg }) });

       await pyodide.loadPackagesFromImports(code);
       const result = await pyodide.runPythonAsync(code);
       self.postMessage({ type: "DEBUG_RESULT", payload: result });
    }
  } catch (err) {
    self.postMessage({ type: "ERROR", payload: err.message });
  }
};
