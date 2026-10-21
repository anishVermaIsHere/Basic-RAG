from pathlib import Path

from app.utils.document.process_files import ALLOWED_FILE_EXTS, process_file


def load_document(file_path: str) -> str:
    path = Path(file_path)
    # BASE_DIR = Path(__file__).resolve().parent
    file_ext = path.suffix.lower()
    if not path.exists():
        raise FileNotFoundError(f"Document not found: {file_path}")

    if not path.is_file():
        raise ValueError(f"Path is not a file: {file_path}")
    
    if file_ext not in ALLOWED_FILE_EXTS:
        raise ValueError(f"Warning: {file_ext} files are not allowed")

    return process_file(file_ext, path)
