import base64
import os
import logging
import json
import re
from openai import OpenAI


def _few_shot_prompt() -> str:
    return """
    You are an assistant that extracts questions and options from images and formats them in a
    specific JSON structure.
    Here are some examples:
    ---
    Example 1:
    Input: An image with the following text:
    "Azure App Configuration provides a service to centrally manage application settings and
        feature flags. Azure App Configuration stores configuration data as key-value pairs.
        Which of the below are valid uses of the label attribute in key pairs?
        Select all that apply.
    1. Create multiple versions of a key value
    2. Specify multiple environments for the same key
    3. Assign value to a key
    4. Store application secrets"

    Output:
    {
      "question": "Azure App Configuration provides a service to centrally manage application
        settings and feature flags. Azure App Configuration stores configuration data
        as key-value pairs.Which of the below are valid uses of the label attribute in key pairs?
        Select all that apply.",
      "options": [
        {
          "option": "Create multiple versions of a key value",
          "selected": false
        },
        {
          "option": "Specify multiple environments for the same key",
          "selected": false
        },
        {
          "option": "Assign value to a key",
          "selected": false
        },
        {
          "option": "Store application secrets",
          "selected": false
        }
      ]
    }

    ---
    Example 2:
    Input: An image with the following text:
    "What is the capital of France? Choose the correct answer.
    A. Paris
    B. London
    C. Berlin
    D. Madrid"

    Output:
    {
      "question": "What is the capital of France? Choose the correct answer.",
      "options": [
        {
          "option": "Paris",
          "selected": false
        },
        {
          "option": "London",
          "selected": false
        },
        {
          "option": "Berlin",
          "selected": false
        },
        {
          "option": "Madrid",
          "selected": false
        }
      ]
    }

    ---
    Now, process the following image and generate the output in the same format:
    """


def extract_content_with_openai(image_data, mime_type: str | None) -> dict | None:
    client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

    base64_image = base64.b64encode(image_data).decode("utf-8")

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": _few_shot_prompt(),
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{base64_image}"},
                    },
                ],
            },
        ],
    )

    content = response.choices[0].message.content
    if not content:
        logging.error("No content returned from OpenAI API")
        return None
    cleaned = re.sub(r"```json|```", "", content).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        logging.error("JSON decode failed: %s", str(e))
        return None
