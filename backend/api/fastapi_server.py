from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from llama_stack_client import LlamaStackClient, Agent, AgentEventLogger, RAGDocument
from llama_stack_client.lib.agents.event_logger import TurnStreamPrintableEvent
import os
import PyPDF2
import requests
from backend.api.helpers import summarize_with_rag_agent, LLAMA_SERVER_URL, client

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # 👈 your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UploadedPDF(BaseModel):
    file_path: str

class UploadedURL(BaseModel):
    url: str

class ChatMessage(BaseModel):
    message: str
    session_id: str

class SummaryResponse(BaseModel):
    summary: str
    session_id: str  # Return session_id for future conversation

class ChatResponse(BaseModel):
    response: str

# Store active sessions
active_sessions = {}

UPLOAD_DIR = "../uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)  # Ensure upload directory exists

@app.post("/upload")
def upload_file(file: UploadFile = File(...)):
    try:
        file_location = os.path.join(UPLOAD_DIR, file.filename)

        with open(file_location, "wb") as f:
            f.write(file.file.read())

        return {"file_path": file_location}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@app.post("/summarize", response_model=SummaryResponse)
def summarize(request: UploadedPDF):
    try:
        # Open uploaded file
        file_path = request.file_path
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)

            # Extract text from the uploaded file
            content = ""
            for page_num in range(len(pdf_reader.pages)):
                page = pdf_reader.pages[page_num]
                content += page.extract_text() + "\n"
            
        # Call the summarize_with_rag_agent function
        summary, session_id = summarize_with_rag_agent(content, active_sessions)
        
        return SummaryResponse(summary=summary, session_id=session_id)  
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing PDF: {str(e)}")

@app.post("/summarize_url", response_model=SummaryResponse)
def summarize_url(request: UploadedURL):
    try:
        url = request.url
        response = requests.get(url)
        content = response.text
        summary, session_id = summarize_with_rag_agent(content, active_sessions)
        return SummaryResponse(summary=summary, session_id=session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing URL: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatMessage):
    try:
        session_id = request.session_id
        
        # Check if session exists
        if session_id not in active_sessions:
            raise HTTPException(status_code=404, detail="Session not found. Please upload a PDF first.")
        
        # Get session data
        session_data = active_sessions[session_id]
        rag_agent = session_data["agent"]
        
        # Add user message to conversation history
        user_message = {"role": "user", "content": request.message}
        session_data["conversation_history"].append(user_message)
        
        # Create turn with the entire conversation history
        response = rag_agent.create_turn(
            messages=[user_message],  # Send just the latest message
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
        session_data["conversation_history"].append({"role": "assistant", "content": full_response})
        
        return ChatResponse(response=full_response)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error chatting with LLM: {str(e)}")

@app.get("/healthz")
def health_check():
    return {"status": "ok"}
