from uuid import uuid4

from pydantic import BaseModel, Field


class Option(BaseModel):
    option: str = Field(..., description="Option text")
    selected: bool = Field(default=False, description="Is this option selected?")


class QuestionBase(BaseModel):
    question: str = Field(..., description="Question text"),
    options: list[Option] = Field(..., description="List of options for the question")
    category: str = Field(..., description="Category of the question")
    tags: list[str] | None = Field(default=[], description="Tags associated with the question")


class Question(QuestionBase):
    id: str = Field(default_factory=lambda: str(uuid4()))

    class Config:
        json_schema_extra = {
            "example": {
                "id": "5d5223b3-633c-4140-a930-be65c67feccd",
                "category": "research",
                "tags": ["azure", "webjobs", "functions"],
                "question": "Your company has a web app named WebApp1. You use the WebJobs SDK to design a triggered App Service background task that automatically invokes a function in the code every time new data is received in a queue. You are preparing to configure the service processes a queue data item. Which of the following is the service you should use?",
                "options": [
                    {
                        "option": "Logic Apps",
                        "selected": False
                    },
                    {
                        "option": "WebJobs",
                        "selected": False
                    },
                    {
                        "option": "Flow",
                        "selected": False
                    },
                    {
                        "option": "Functions",
                        "selected": False
                    }
                ]
            }
        }
