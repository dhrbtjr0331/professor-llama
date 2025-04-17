const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

let backendProcess;
let llamaProcess;
let ollamaProcess;

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
    },
  });

  win.loadFile(path.join(__dirname, "frontend/dist/index.html"));

  win.on("closed", () => {
    app.quit(); // triggers 'before-quit' handlers
  });
}

// Check if Ollama server is running 
function isOllamaRunning(callback) {
  const req = http.get("http://localhost:11434/api/tags", (res) => {
    callback(res.statusCode === 200);
  });

  req.on("error", () => callback(false));
  req.end();
}

// Start Ollama Server if not already running 
function startOllamaIfNeeded() {
  isOllamaRunning((isRunning) => {
    if (isRunning) {
      console.log("Ollama is already running.");
    } else {
      console.log("Ollama not running. Starting it...");
      ollamaProcess = spawn("ollama", ["serve"], {
        stdio: "inherit",
        shell: true,
      });

      ollamaProcess.on("error", (err) => {
        console.error("Failed to start Ollama server:", err);
      });
    }
  });
}

// Start FastAPI backend 
function startBackend() {
  console.log("Starting FastAPI server on port 8000...");
  backendProcess = spawn(
    "uvicorn",
    ["backend.api.fastapi_server:app", "--host", "127.0.0.1", "--port", "8000"],
    {
      stdio: "inherit",
      shell: true,
    }
  );
}

// Start Llama Stack Server 
function startLlamaServer() {
  console.log("Starting Llama Stack Server...");
  
  // Add SSL certificate configuration to environment
  const env = { 
    ...process.env, 
    INFERENCE_MODEL: "llama3.2:3b",
    // Add these SSL environment variables
    SSL_CERT_FILE: "/etc/ssl/cert.pem", // Common macOS location
    NODE_TLS_REJECT_UNAUTHORIZED: "1"   // Ensure SSL verification is on
  };

  llamaProcess = spawn(
    "llama",
    ["stack", "build", "--template", "ollama", "--image-type", "venv", "--image-name", "llama-app-server", "--run"],
    {
      stdio: "inherit",
      shell: true,
      env: env,
    }
  );

  llamaProcess.on("error", (err) => {
    console.error("Failed to start Llama Stack Server:", err);
  });
}

// Shutdown handlers 
function stopBackend() {
  if (backendProcess) {
    console.log("Shutting down FastAPI backend...");
    backendProcess.kill();
    backendProcess = null;
  }
}

function stopLlamaServer() {
  if (llamaProcess) {
    console.log("Shutting down Llama Stack Server...");
    llamaProcess.kill();
    llamaProcess = null;
  }
}

function stopOllamaServer() {
  if (ollamaProcess) {
    console.log("Shutting down Ollama Server...");
    ollamaProcess.kill();
    ollamaProcess = null;
  }
}

// App Lifecycle 
app.whenReady().then(() => {
  startOllamaIfNeeded();
  startLlamaServer();
  startBackend();
  createWindow();
});

app.on("before-quit", () => {
  stopOllamaServer();
  stopLlamaServer();
  stopBackend();
});
