from fastapi import APIRouter, Depends

from app.api.dependencies import get_question_repository
from app.logging_config import get_logger
from app.models.question import Question
from app.repositories.question_repository import QuestionRepository

router = APIRouter(
    prefix="/api/questions",
    tags=["questions"],
    responses={404: {"description": "Not found"}},
)

logger = get_logger("api.endpoints.question_router")


@router.get("/", response_model=list[Question])
async def get_all_questions(repo: QuestionRepository = Depends(get_question_repository)):
    try:
        logger.info("Fetching all questions")
        return await repo.get_all_questions()
    except Exception as e:
        logger.error(f"Failed to get all questions: {e}")
        return {"error": str(e)}

