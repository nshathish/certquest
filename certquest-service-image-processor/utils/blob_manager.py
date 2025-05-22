import logging
import os
import azure.functions as func

from azure.storage.blob import BlobServiceClient

from .config import CONNECTION_STRING_NAME, INPUT_CONTAINER_NAME


def delete_blob(blob_name: str | None):
    if blob_name is None:
        logging.error("Blob name is requierd.")
        return

    connection_string = os.getenv(CONNECTION_STRING_NAME)
    if connection_string is None:
        logging.error("Connection string is required.")
        return

    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    container_name = blob_name.split("/")[0]
    blob_path = "/".join(blob_name.split("/")[1:])

    container_client = blob_service_client.get_container_client(container_name)
    try:
        container_client.delete_blob(blob_path)
    except Exception as e:
        logging.error(f"Error deleting blob {blob_name}: {e}")


def get_blob_mime_type(blob: func.InputStream) -> str | None:

    connection_string = os.getenv(CONNECTION_STRING_NAME)
    logging.info("Connection string::get_blob_mime_type: %s", connection_string)
    if connection_string is None:
        logging.error("Connection string is required.")
        return None

    blob_service_client = BlobServiceClient.from_connection_string(connection_string)
    container_client = blob_service_client.get_container_client(INPUT_CONTAINER_NAME)
    blob_name = str(blob.name).split("/", 1)[-1]
    blob_client = container_client.get_blob_client(blob_name)

    blob_properties = blob_client.get_blob_properties()
    mime_type = blob_properties.content_settings.content_type
    return mime_type
