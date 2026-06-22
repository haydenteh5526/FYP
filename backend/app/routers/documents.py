import uuid

from fastapi import APIRouter, Depends, Form, HTTPException, UploadFile
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_user_id, get_db
from app.models.base import DocChunk, Document
from app.schemas.document import DocumentList, DocumentOut, DocumentUpdate
from app.services import categorisation_service, chunking_service, embedding_service, ocr_service, storage_service

router = APIRouter()

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "application/pdf"}
MAX_FILE_SIZE = 20 * 1024 * 1024  # 20MB


@router.post("", response_model=DocumentOut, status_code=201)
async def upload_document(
    file: UploadFile,
    title: str | None = Form(None),
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(400, f"File type {file.content_type} not allowed")

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(413, "File too large (max 20MB)")

    s3_key = storage_service.upload_file(
        file_bytes, str(user_id), file.filename or "upload", file.content_type
    )

    raw_text = ocr_service.extract_text(file_bytes, file.content_type)

    # Auto-categorise document
    metadata = categorisation_service.categorise_document(raw_text)

    doc = Document(
        user_id=user_id,
        title=title or metadata.title or file.filename or "Untitled",
        s3_key_original=s3_key,
        file_size=len(file_bytes),
        raw_text=raw_text or None,
        brand=metadata.brand,
        model=metadata.model,
        document_type=metadata.document_type,
    )
    db.add(doc)
    await db.commit()
    await db.refresh(doc)

    # Chunk text and generate embeddings
    if raw_text:
        chunks = chunking_service.chunk_text(raw_text)
        embeddings = embedding_service.get_embeddings(chunks)
        for i, (chunk_text, embedding) in enumerate(zip(chunks, embeddings)):
            db.add(DocChunk(
                document_id=doc.id,
                chunk_index=i,
                chunk_text=chunk_text,
                embedding=embedding,
            ))
        await db.commit()

    return _to_response(doc)


@router.get("", response_model=DocumentList)
async def list_documents(
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    query = select(Document).where(Document.user_id == user_id).offset(skip).limit(limit)
    result = await db.execute(query)
    docs = result.scalars().all()

    count_query = select(func.count()).select_from(Document).where(Document.user_id == user_id)
    total = (await db.execute(count_query)).scalar() or 0

    return DocumentList(
        documents=[_to_response(d) for d in docs],
        total=total,
    )


@router.get("/{document_id}", response_model=DocumentOut)
async def get_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    doc = await _get_doc_or_404(document_id, user_id, db)
    return _to_response(doc)


@router.patch("/{document_id}", response_model=DocumentOut)
async def update_document(
    document_id: uuid.UUID,
    update: DocumentUpdate,
    db: AsyncSession = Depends(get_db),
    user_id: uuid.UUID = Depends(get_current_user_id),
):
    doc = await _get_doc_or_404(document_id, user_id, db)
    for field, value in update.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    await db.commit()
    await db.refresh(doc)
    return _to_response(doc)


@router.delete("/{document_id}", status_code=204)
async def delete_document(document_id: uuid.UUID, db: AsyncSession = Depends(get_db), user_id: uuid.UUID = Depends(get_current_user_id)):
    doc = await _get_doc_or_404(document_id, user_id, db)
    storage_service.delete_file(doc.s3_key_original)
    if doc.s3_key_thumbnail:
        storage_service.delete_file(doc.s3_key_thumbnail)
    await db.delete(doc)
    await db.commit()


async def _get_doc_or_404(document_id: uuid.UUID, user_id: uuid.UUID, db: AsyncSession) -> Document:
    query = select(Document).where(Document.id == document_id, Document.user_id == user_id)
    result = await db.execute(query)
    doc = result.scalar_one_or_none()
    if not doc:
        raise HTTPException(404, "Document not found")
    return doc


def _to_response(doc: Document) -> DocumentOut:
    image_url = storage_service.get_presigned_url(doc.s3_key_original)
    return DocumentOut(
        id=doc.id,
        title=doc.title,
        brand=doc.brand,
        model=doc.model,
        document_type=doc.document_type,
        category_id=doc.category_id,
        raw_text=doc.raw_text,
        file_size=doc.file_size,
        page_count=doc.page_count,
        ocr_confidence=doc.ocr_confidence,
        image_url=image_url,
        created_at=doc.created_at,
        updated_at=doc.updated_at,
    )
