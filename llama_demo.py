from llama_stack_client import LlamaStackClient

client = LlamaStackClient(base_url="http://localhost:8321")

# List available models
models = client.models.list()

for llm in models:
    if llm.model_type == "llm":
        print("Model:", llm.identifier)