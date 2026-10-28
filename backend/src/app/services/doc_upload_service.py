import re
import uuid
from pathlib import Path

from fastapi import HTTPException, UploadFile

from app.utils.document.process_files import ALLOWED_FILE_EXTS
from app.utils.document.upload_files import upload_to_cloudinary, delete_from_cloudinary

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


class DocUploadService:
  async def upload(self, file: UploadFile) -> dict:
    if not file.filename:
      raise HTTPException(status_code=400, detail="filename is required")

    file_ext = Path(file.filename).suffix.lower()
    if file_ext not in ALLOWED_FILE_EXTS:
      raise HTTPException(
        status_code=400,
        detail=f"Unsupported file type '{file_ext}'. Allowed: {', '.join(sorted(ALLOWED_FILE_EXTS))}",
      )

    # read one byte past the limit so oversized files are rejected without loading them fully
    content = await file.read(MAX_FILE_SIZE + 1)
    if not content:
      raise HTTPException(status_code=400, detail="file is empty")
    if len(content) > MAX_FILE_SIZE:
      raise HTTPException(status_code=413, detail="file exceeds 10 MB limit")

    try:
      result = await upload_to_cloudinary(content, public_id=f"{uuid.uuid4()}{file_ext}")
    except Exception as e:
      raise HTTPException(status_code=502, detail=f"Upload to storage failed: {e}")

    return {
      "filename": file.filename,
      "content_type": file.content_type or "application/octet-stream",
      "file_size": len(content),
      "storage_path": result["secure_url"],
      "public_id": result["public_id"],
      "content": content,
    }

  @staticmethod
  def public_id_from_url(url: str) -> str | None:
    # .../raw/upload/v1793203028/look-rag/documents/<uuid>.pdf -> look-rag/documents/<uuid>.pdf
    match = re.search(r"/raw/upload/(?:v\d+/)?(.+)$", url)
    return match.group(1) if match else None

  async def delete(self, public_id: str) -> None:
    try:
      await delete_from_cloudinary(public_id)
    except Exception as e:
      raise HTTPException(status_code=502, detail=f"Delete from storage failed: {e}")
