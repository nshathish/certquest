import logging
import os

from rich.logging import RichHandler


def setup_logging():
    if os.getenv("ENVIRONMENT", "production") != "production":
        import urllib3
        urllib3.disable_warnings()

    logger = logging.getLogger("app")
    logger.setLevel(logging.INFO)

    if not logger.handlers:
        handler = RichHandler(
            rich_tracebacks=True,
            show_path=False,
            show_time=True
        )
        handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

    return logger


def get_logger(name: str | None = None) -> logging.Logger:
    if name:
        return logging.getLogger(f"app.{name}")
    return logging.getLogger("app")
