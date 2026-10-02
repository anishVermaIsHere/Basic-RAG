from pathlib import Path


def load_document(file_path: str) -> str:
    path = Path(file_path)
    # BASE_DIR = Path(__file__).resolve().parent
    
    if not path.exists():
        raise FileNotFoundError(
            f"Document not found: {file_path}"
        )

    if not path.is_file():
        raise ValueError(
            f"Path is not a file: {file_path}"
        )

    return path.read_text(encoding="utf-8")