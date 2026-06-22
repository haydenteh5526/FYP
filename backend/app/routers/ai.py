from fastapi import APIRouter

router = APIRouter()


@router.post("/ask")
async def ask_question():
    return {"answer": "AI Q&A - not implemented", "sources": []}
