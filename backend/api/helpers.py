from llama_stack_client import LlamaStackClient, Agent, AgentEventLogger, RAGDocument
from llama_stack_client.lib.agents.event_logger import TurnStreamPrintableEvent
import uuid

LLAMA_SERVER_URL = "http://localhost:8321"
client = LlamaStackClient(base_url=LLAMA_SERVER_URL)

def summarize_with_rag_agent(content: str, active_sessions: dict):
    # Store the uploaded documents into RAGDocument form
    documents = [
        RAGDocument(
            document_id = "pdf-1",
            content=content,
            mime_type="text/plain",
            metadata={}
        )
    ]

    # Insert documents into vector database
    vector_db_id = f"vector-db-{uuid.uuid4().hex}"
    client.vector_dbs.register(
        vector_db_id=vector_db_id,
        embedding_model="all-MiniLM-L6-v2",
        embedding_dimension=384,
    )
    client.tool_runtime.rag_tool.insert(
        documents=documents,
        vector_db_id=vector_db_id,
        chunk_size_in_tokens=512,
    )

    # Create a RAG agent with explicit instructions to use the PDF content
    rag_agent = Agent(
        client,
        model="llama3.2:3b",
        instructions=f"""You are a teaching assistant who specializes in summarizing materials and answering questions about them. 
        Search for and read the PDF content that has been uploaded to the vector database.
        First, provide a summary when asked. Then, answer specific questions about the document content.
        Use bullet points when appropriate.
        Base your responses ONLY on the actual content of the uploaded PDF, not on generic information.""",
        tools = [
            {
            "name": "builtin::rag/knowledge_search",
            "args" : {
                "vector_db_ids": [vector_db_id],
                "top_k": 10  # Increase number of chunks to retrieve more content
            }
            }
        ]
    )

    session_id = rag_agent.create_session("pdf-chat-session")
    
    # Store agent in active sessions
    active_sessions[session_id] = {
        "agent": rag_agent,
        "vector_db_id": vector_db_id,
        "conversation_history": []
    }

    # Create a user prompt that explicitly asks to use the document
    prompt = f"""Please summarize the PDF document I just uploaded. 
    The document is in the vector database with ID {vector_db_id}.
    Organize your summary with clear sections and use bullet points where appropriate.
    Your summary should be a page or two long for the student to use as a helpful resource.
    Focus ONLY on the actual content in the PDF, not general information."""
    
    # Store user message in conversation history
    active_sessions[session_id]["conversation_history"].append({"role": "user", "content": prompt})
    
    # Get the response
    response = rag_agent.create_turn(
        messages=[{"role": "user", "content": prompt}],
        session_id=session_id,
    )
    
    # Use a logger to collect the response content
    full_response = ""
    logger = AgentEventLogger()

    for log in logger.log(response):
        if isinstance(log, TurnStreamPrintableEvent) and hasattr(log, 'content'):
            full_response += log.content
        log.print()

    if not full_response.strip():
        full_response = "No content was generated."
    
    # Store assistant message in conversation history
    active_sessions[session_id]["conversation_history"].append({"role": "assistant", "content": full_response})
    
    # Return the summary and session ID for future conversation
    return full_response, session_id