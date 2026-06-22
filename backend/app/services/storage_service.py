import uuid

import boto3
from botocore.config import Config

from app.config import settings


def get_s3_client():
    return boto3.client(
        "s3",
        endpoint_url=settings.S3_ENDPOINT,
        aws_access_key_id=settings.S3_ACCESS_KEY,
        aws_secret_access_key=settings.S3_SECRET_KEY,
        config=Config(signature_version="s3v4"),
        region_name="us-east-1",
    )


def upload_file(file_bytes: bytes, user_id: str, filename: str, content_type: str) -> str:
    s3 = get_s3_client()
    ext = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    key = f"users/{user_id}/{uuid.uuid4()}.{ext}"
    s3.put_object(
        Bucket=settings.S3_BUCKET,
        Key=key,
        Body=file_bytes,
        ContentType=content_type,
    )
    return key


def get_presigned_url(key: str, expires_in: int = 900) -> str:
    s3 = get_s3_client()
    return s3.generate_presigned_url(
        "get_object",
        Params={"Bucket": settings.S3_BUCKET, "Key": key},
        ExpiresIn=expires_in,
    )


def delete_file(key: str) -> None:
    s3 = get_s3_client()
    s3.delete_object(Bucket=settings.S3_BUCKET, Key=key)


def ensure_bucket_exists() -> None:
    s3 = get_s3_client()
    try:
        s3.head_bucket(Bucket=settings.S3_BUCKET)
    except s3.exceptions.ClientError:
        s3.create_bucket(Bucket=settings.S3_BUCKET)
