from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def search_documents(q: str = ""):
    return {"results": [], "query": q}
