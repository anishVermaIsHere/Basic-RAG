from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.document_upload import router as document_router

app = FastAPI(title="Basic RAG App")
app.add_middleware(
    CORSMiddleware,
    allow_origins = ["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app_router = APIRouter(prefix="/api/v1")

@app.get("/")
def read_root():
    return {"Hello": "World"}


app_router.include_router(document_router)
app.include_router(app_router)


