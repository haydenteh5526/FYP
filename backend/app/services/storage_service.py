import uuid
from supabase import create_client, Client
from app.config import settings

def get_supabase_client() -> Client:
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

def upload_file(file_bytes: bytes, user_id: str, filename: str, content_type: str) -> str:
    supabase = get_supabase_client()
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    key = f"users/{user_id}/{uuid.uuid4()}.{ext}"
    supabase.storage.from_(settings.S3_BUCKET).upload(
        path=key,
        file=file_bytes,
        file_options={"content-type": content_type}
    )
    return key

def get_presigned_url(key: str, expires_in: int = 900) -> str:
    supabase = get_supabase_client()
    return supabase.storage.from_(settings.S3_BUCKET).create_signed_url(key, expires_in)

def delete_file(key: str) -> None:
    supabase = get_supabase_client()
    supabase.storage.from_(settings.S3_BUCKET).remove([key])

def download_file(key: str) -> tuple[bytes, str]:
    supabase = get_supabase_client()
    res = supabase.storage.from_(settings.S3_BUCKET).download(key)
    return res, "application/octet-stream"

def ensure_bucket_exists() -> None:
    supabase = get_supabase_client()
    buckets = supabase.storage.list_buckets()
    if not any(b.name == settings.S3_BUCKET for b in buckets):
        supabase.storage.create_bucket(settings.S3_BUCKET, options={"public": True})
