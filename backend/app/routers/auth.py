from fastapi import APIRouter

router = APIRouter()


@router.post("/register")
async def register():
    return {"message": "register - not implemented"}


@router.post("/login")
async def login():
    return {"message": "login - not implemented"}
