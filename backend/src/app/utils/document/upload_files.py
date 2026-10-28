import io
import asyncio

import cloudinary
import cloudinary.uploader

from app.core.config import settings


cloudinary.config(
  cloud_name = settings.CLOUDINARY.CLOUD_NAME,
  api_key = settings.CLOUDINARY.API_KEY,
  api_secret = settings.CLOUDINARY.SECRET_KEY,
  secure = True
)


def _upload(content: bytes, public_id: str, folder: str) -> dict:
  # resource_type="raw" is required for non-image files (pdf, docx, txt, md)
  return cloudinary.uploader.upload(
    io.BytesIO(content),
    resource_type="raw",
    public_id=public_id,
    folder=folder,
    overwrite=False,
  )


async def upload_to_cloudinary(content: bytes, public_id: str, folder: str = settings.CLOUDINARY.FOLDER) -> dict:
  """Upload file bytes to Cloudinary without blocking the event loop."""
  return await asyncio.to_thread(_upload, content, public_id, folder)


def _delete(public_id: str) -> dict:
  return cloudinary.uploader.destroy(public_id, resource_type="raw")


async def delete_from_cloudinary(public_id: str) -> dict:
  return await asyncio.to_thread(_delete, public_id)
