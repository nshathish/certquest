import azure.functions as func
import logging

from utils.blob_manager import delete_blob, get_blob_metadata
from utils.image_validator import is_valid_image
from utils.openai_service import extract_content_with_openai
from utils.config import (
    CONNECTION_STRING_NAME,
    INPUT_CONTAINER_NAME,
    OUTPUT_CONTAINER_NAME,
    COSMOSDB_CONNECTION_STRING_NAME,
    COSMOSDB_DATABASE_NAME,
    COSMOSDB_COLLECTION_NAME,
)


app = func.FunctionApp()


@app.blob_trigger(
    arg_name="myblob",
    path=f"{INPUT_CONTAINER_NAME}/{{image_name}}",
    connection=CONNECTION_STRING_NAME,
)
@app.cosmos_db_output(
    arg_name="outputDocument",
    database_name=COSMOSDB_DATABASE_NAME,
    container_name=COSMOSDB_COLLECTION_NAME,
    connection=COSMOSDB_CONNECTION_STRING_NAME,
)
@app.blob_output(
    arg_name="processedBlob",
    path=f"{OUTPUT_CONTAINER_NAME}/{{image_name}}",
    connection=CONNECTION_STRING_NAME,
)
@app.blob_output(
    arg_name="failedBlob",
    path=f"{OUTPUT_CONTAINER_NAME}/{{image_name}}",
    connection=CONNECTION_STRING_NAME,
)
def process_raw_image(
    myblob: func.InputStream,
    outputDocument: func.Out[func.Document],
    processedBlob: func.Out[bytes],
    failedBlob: func.Out[bytes],
):
    logging.info(
        f"Python blob trigger function processed blob"
        f"Name: {myblob.name}"
        f"Blob Size: {myblob.length} bytes"
    )

    if not myblob.name:
        logging.error("Blob name is empty")
        return

    is_image = is_valid_image(myblob.name)
    if not is_image:
        logging.error("Invalid image type")
        failedBlob.set(myblob.read())
        delete_blob(myblob.name)
        return

    meta_and_mime_type = get_blob_metadata(myblob)
    if meta_and_mime_type is None:
        logging.error("Failed to retrieve blob metadata")
        failedBlob.set(myblob.read())
        delete_blob(myblob.name)
        return

    mime_type, metadata = meta_and_mime_type
    if mime_type is None:
        logging.error("Failed to retrieve blob mime type")
        failedBlob.set(myblob.read())
        delete_blob(myblob.name)
        return

    logging.info("Processing image: %s", myblob.name)
    extracted_json = extract_content_with_openai(myblob.read(), mime_type)
    if extracted_json is None:
        logging.error("Failed to extract content from image: %s", myblob.name)
        failedBlob.set(myblob.read())
        delete_blob(myblob.name)
        return

    combined = metadata | extracted_json | {"image_name": myblob.name}
    logging.info("Combined metadata: %s", combined)

    outputDocument.set(func.Document.from_dict(combined))
    processedBlob.set(myblob.read())
    logging.info("Processed blob set to output: %s", processedBlob)
    logging.info("Document set to Cosmos DB: %s", outputDocument)

    delete_blob(myblob.name)
    logging.info("Deleted blob: %s", myblob.name)
