import { useState, useEffect } from 'react';

export default function useServerStatus() {
  const [backendReady, setBackendReady] = useState(false);
  const [llamaReady, setLlamaReady] = useState(false);
  const [ollamaReady, setOllamaReady] = useState(false);

  useEffect(() => {
    const interval = setInterval(async () => {
      // ✅ Check FastAPI health
      try {
        const res = await fetch("http://localhost:8000/healthz");
        if (res.ok) {
          setBackendReady(true);
        }
      } catch {}

      // ✅ Check LLaMA stack readiness using model listing
      try {
        const res = await fetch("http://localhost:8321/v1/models");
        if (res.ok) {
          setLlamaReady(true);
        }
      } catch {}

      // ✅ Check Ollama server readiness
      try {
        const res = await fetch("http://localhost:11434/api/tags");
        if (res.ok) {
          setOllamaReady(true);
        }
      } catch {}
    }, 1000); // poll every second

    return () => clearInterval(interval);
  }, []);

  // Only return true when all three services are ready
  return backendReady && llamaReady && ollamaReady;
}
