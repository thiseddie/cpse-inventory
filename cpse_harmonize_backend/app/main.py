from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.cpse import router as cpse_router

app = FastAPI(
    title="CPSE Harmonize API",
    version="1.0.0",
    description="Backend API for CPSE organization and material harmonization."
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cpse_router)


@app.get("/")
def root():
    return {"message": "CPSE Harmonize backend is running"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
