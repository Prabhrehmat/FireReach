from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from agent import run_firereach_agent

app = FastAPI(title="FireReach API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class OutreachRequest(BaseModel):
    company_name: str
    icp: str
    recipient_email: str

@app.get("/")
def root():
    return {"status": "FireReach is running 🔥"}

@app.post("/run-agent")
def run_agent(request: OutreachRequest):
    try:
        result = run_firereach_agent(
            company_name=request.company_name,
            icp=request.icp,
            recipient_email=request.recipient_email
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))