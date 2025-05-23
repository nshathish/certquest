from app.db.cosmosdb_engine import CosmosDBEngine
from app.logging_config import get_logger
from app.models.question import Question

logger = get_logger("repositories.question_repository")

class QuestionRepository:
    def __init__(self):
        self.cosmos_engine = CosmosDBEngine(container_name="questionbank")


    async def get_all_questions(self, limit: int = 100) -> list[Question]:
        try:
            questions_data = await self.cosmos_engine.get_all_items(limit=limit)
            return [Question(**question) for question in questions_data]

        except Exception as e:
            logger.error(f"Failed to get all questions: {e}")
            raise