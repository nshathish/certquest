from dotenv import load_dotenv
from fastapi import FastAPI, Depends

from app.logging_config import get_logger, setup_logging
from app.api.endpoints.question_router import router as question_router

load_dotenv()
setup_logging()
logger = get_logger()
app = FastAPI()

app.include_router(question_router)


@app.get("/")
async def root():
    logger.info("Root endpoint accessed")
    return {"message": "Hello World"}
