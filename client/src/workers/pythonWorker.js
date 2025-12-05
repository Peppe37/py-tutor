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

      // We don't want to use loadPackagesFromImports because it might be slow or try to load unneeded things.
      // But for better UX, we might want to scan the code for imports.
      // For now, let's rely on explicit package installation if needed,
      // OR use pyodide.loadPackagesFromImports(code) if the user wants it auto-detected.
      // Let's try auto-detection which is friendly.
      await pyodide.loadPackagesFromImports(code);

      await pyodide.runPythonAsync(code);
      self.postMessage({ type: "DONE" });
    }
    else if (action === "debug") {
      // Debug logic is passed as a code string wrapper from the main thread
      // so we treat it almost like run, but expect a JSON return.
       pyodide.setStdout({ batched: (msg) => self.postMessage({ type: "STDOUT", payload: msg }) });

       // Ensure packages are loaded for debug trace too
       // (Though usually debug is on simple code)
       await pyodide.loadPackagesFromImports(code);

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
