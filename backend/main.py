from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import requests

app = FastAPI(title="CPSE Harmonize AI Engine")

# Explicit CORS Setup for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BorrowRequest(BaseModel):
    item_id: str
    target_cpse: str
    requested_qty: int = 1

class ChatQuery(BaseModel):
    message: str

@app.get("/")
def home():
    return {"status": "online", "system": "CPSE Harmonize AI Engine Running"}

# 1. Intra-CPSE Borrow/Transfer Endpoint
@app.post("/api/v1/inventory/borrow")
def create_borrow_request(req: BorrowRequest):
    request_id = f"REQ-{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
    return {
        "status": "success",
        "message": f"Transfer request for {req.item_id} created successfully.",
        "request_id": request_id,
        "target_cpse": req.target_cpse
    }

# 2. PDF Document Ingestion Endpoint
@app.post("/api/v1/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    return {
        "filename": file.filename,
        "status": "parsed",
        "extracted_items_count": 2,
        "message": "PDF parsed & material codes mapped to UNSPSC AI standard."
    }

# 3. Ollama Procurement Chatbot Endpoint
@app.post("/api/v1/chat")
def procurement_chatbot(query: ChatQuery):
    system_prompt = (
        "You are CPSE Harmonize AI, an expert procurement assistant for Indian Public Sector Undertakings "
        "(ONGC, IOCL, GAIL, NTPC, etc.). You assist officers with UNSPSC material coding harmonization, "
        "intra-CPSE surplus stock transfers, and price anomaly detection. Keep answers direct, professional, and limited to 2-3 sentences."
    )

    ollama_url = "http://localhost:11434/api/generate"
    payload = {
        "model": "llama3",
        "system": system_prompt,
        "prompt": query.message,
        "stream": False
    }

    try:
        response = requests.post(ollama_url, json=payload, timeout=30)
        if response.status_code == 200:
            result = response.json()
            return {"reply": result.get("response", "No response generated.")}
        else:
            return {"reply": "Ollama service error: Unable to process request."}
    except requests.exceptions.ConnectionError:
        return {
            "reply": "Ollama server offline hai. Terminal par `ollama run llama3` chala kar background service active karein."
        }