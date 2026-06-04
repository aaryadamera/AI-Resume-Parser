from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from .database import create_tables
from .routes import router

# Create upload directory
os.makedirs("uploads", exist_ok=True)

app = FastAPI(
    title="AI Resume Parser API",
    description="Intelligent resume parsing system powered by Claude AI",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "https://*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create tables on startup
create_tables()

# Include routes
app.include_router(router, prefix="/api")

@app.get("/")
def root():
    return {"message": "AI Resume Parser API is running!", "docs": "/docs"}


