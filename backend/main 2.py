from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import Base,engine
from .routers import cpse,materials,harmonization,mappings,dashboard,search
Base.metadata.create_all(bind=engine)
app=FastAPI(title="CPSE-MATCH API",version="1.0.0",description="AI-driven material code standardization across CPSEs")
app.add_middleware(CORSMiddleware,allow_origins=["*"],allow_credentials=True,allow_methods=["*"],allow_headers=["*"])
for r in [cpse.router,materials.router,harmonization.router,mappings.router,dashboard.router,search.router]: app.include_router(r,prefix="/api")
@app.get("/")
def root(): return {"message":"CPSE-MATCH backend is running","docs":"/docs"}
@app.get("/health")
def health(): return {"status":"healthy"}
