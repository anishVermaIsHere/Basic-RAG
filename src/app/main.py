from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from sqlalchemy.orm import configure_mappers

from app.db.database import init_db, close_db
from app.api.v1.document import router as document_router



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Run decoupled startup logic
    await init_db()
    
    yield  # Hand over control to FastAPI to process incoming requests

    # Run decoupled shutdown logic
    await close_db()


configure_mappers()

app = FastAPI(title="Basic RAG App", lifespan=lifespan)
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


