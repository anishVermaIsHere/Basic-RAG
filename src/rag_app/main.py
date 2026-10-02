from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

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


app.include_router(app_router)

