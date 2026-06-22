from fastapi import APIRouter

router = APIRouter()


@router.post("")
async def upload_document():
    return {"message": "upload - not implemented"}


@router.get("")
async def list_documents():
    return {"documents": []}


@router.get("/{document_id}")
async def get_document(document_id: str):
    return {"message": "get document - not implemented"}


@router.delete("/{document_id}")
async def delete_document(document_id: str):
    return {"message": "delete - not implemented"}
