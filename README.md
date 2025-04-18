# Professor Llama 🦙

A fully-featured offline AI assistant powered by Meta's LLaMA 3 models. Professor Llama runs locally on your device using Llama Stack, Ollama, and a FastAPI backend, providing an interactive AI experience without requiring constant internet connectivity.

## Demo

[(https://img.youtube.com/vi/ShVB6xLYekc/0.jpg)](https://www.youtube.com/watch?v=ShVB6xLYekc)

## Features

- Run completely offline after initial setup
- Powered by Meta's LLaMA 3 models via Ollama
- Online version available with extended functionality
- Built with modern technologies:
  - FastAPI backend for efficient Python processing
  - Electron for cross-platform desktop support
  - Vite for frontend development
- Compatible with macOS, Windows, and Linux

## Prerequisites

Before installation, ensure you have:
- [Homebrew](https://brew.sh/) package manager
- Python 3.10 or newer
- Node.js and npm

## Installation

### 1. Ollama Setup

Install Ollama and download the LLaMA 3 model:
```bash
# Download Ollama from the official website
open https://ollama.com/download

# After installation, pull the model
ollama pull llama3.2:3b
```

### 2. Install External Dependencies

```bash
brew install cmake pkg-config sentencepiece
```

### 3. Project Setup

```bash
# Clone or download the project
# If downloaded as ZIP, extract the file

# Navigate to the project directory
cd professor-llama

# Install Node.js dependencies
npm install

# Create and activate Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install -r ./backend/requirements.txt
```

### 4. Launch the Application

```bash
npm run dev
```

The application window should appear, providing access to the Professor Llama interface.


