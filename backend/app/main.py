from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import sys
import os

# Add parent directory to path to import src
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from backend.app.routes import claims, dashboard, rules, analytics

app = FastAPI(
    title="NHA Claims Auto-Adjudication API",
    description="Enterprise API for claims processing",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(claims.router, prefix="/api/claims", tags=["Claims"])
app.include_router(rules.router, prefix="/api/rules", tags=["Rules"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])

@app.get("/")
async def root():
    return {
        "message": "NHA Claims Auto-Adjudication API",
        "version": "1.0.0",
        "docs": "/docs",
    }

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
