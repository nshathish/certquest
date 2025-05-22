import logging
import os
import json
import azure.functions as func

from azure.storage.blob import BlobServiceClient, BlobClient

from .config import CONNECTION_STRING_NAME, INPUT_CONTAINER_NAME


def delete_blob(blob_name: str | None):
    if blob_name is None:
        logging.error("Blob name is requierd.")
        return

    client = _get_blob_service_client()
    if client is None:
        return

    container_name, blob_path = _split_blob_name(blob_name)
    container_client = client.get_container_client(container_name)
    try:
        container_client.delete_blob(blob_path)
    except Exception as e:
        logging.error(f"Error deleting blob {blob_name}: {e}")


def get_blob_mime_type(blob: func.InputStream) -> str | None:
    blob_client = _get_blob_client(blob)
    if blob_client is None:
        return None

    blob_properties = blob_client.get_blob_properties()
    return blob_properties.content_settings.content_type


def get_blob_metadata(
    blob: func.InputStream,
) -> tuple[str, dict[str, str | None | list[str]]] | None:
    blob_client = _get_blob_client(blob)
    if blob_client is None:
        return None

    blob_properties = blob_client.get_blob_properties()
    metadata = blob_properties.metadata
    if not metadata:
        logging.error("No metadata found for the blob.")
        return None

    mime_type = metadata.get("mimeType")
    if mime_type is None:
        logging.error("No mimeType found in metadata.")
        return None

    return (mime_type, _extract_blob_metadata_fields(metadata))


def _get_blob_service_client() -> BlobServiceClient | None:
    connection_string = os.getenv(CONNECTION_STRING_NAME)
    if connection_string is None:
        logging.error("Connection string is required.")
        return None

    return BlobServiceClient.from_connection_string(connection_string)


def _get_blob_client(blob: func.InputStream) -> BlobClient | None:
    blob_service_client = _get_blob_service_client()
    if blob_service_client is None:
        return None

    container_client = blob_service_client.get_container_client(INPUT_CONTAINER_NAME)
    blob_name = _extract_blob_name(blob)
    return container_client.get_blob_client(blob_name)


def _extract_blob_name(blob: func.InputStream) -> str:
    return str(blob.name).split("/", 1)[-1]


def _split_blob_name(blob_name: str) -> tuple[str, str]:
    parts = blob_name.split("/", 1)
    if len(parts) != 2:
        logging.error(f"Invalid blob name format: {blob_name}")
        return "", ""

    return parts[0], parts[1]


def _extract_blob_metadata_fields(metadata: dict) -> dict[str, str | None | list[str]]:
    return {
        "id": metadata.get("id"),
        "category": metadata.get("category"),
        "tags": _parse_tags(metadata.get("tags")),
    }


def _parse_tags(tags_str: str | None) -> list[str]:
    if not tags_str:
        return []
    try:
        tags = json.loads(tags_str)
        if isinstance(tags, str):
            tags = json.loads(tags)

        if isinstance(tags, list) and all(isinstance(tag, str) for tag in tags):
            return tags
        else:
            logging.error(f"Unexpected tags format: {tags}")
            return []
    except json.JSONDecodeError as e:
        logging.error(f"Error decoding tags: {e}")
        return []
