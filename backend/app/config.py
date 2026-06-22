from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://user:pass@localhost:5432/docvault"
    S3_ENDPOINT: str = "http://localhost:9000"
    S3_ACCESS_KEY: str = "minioadmin"
    S3_SECRET_KEY: str = "minioadmin"
    S3_BUCKET: str = "documents"
    OPENAI_API_KEY: str = ""
    OCR_BACKEND: str = "tesseract"
    AWS_REGION: str = "eu-west-1"
    JWT_SECRET: str = "change-me-in-production"
    JWT_EXPIRY_MINUTES: int = 1440
    CORS_ORIGINS: list[str] = ["http://localhost:3000"]

    class Config:
        env_file = ".env"


settings = Settings()
