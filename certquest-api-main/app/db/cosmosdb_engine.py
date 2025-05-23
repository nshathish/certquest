import os
from typing import Any

from azure.cosmos import CosmosClient, exceptions, PartitionKey
from azure.identity import DefaultAzureCredential

from app.logging_config import get_logger

logger = get_logger("db.cosmosdb_engine")


class CosmosDBEngine:
    def __init__(self, container_name: str):
        self._endpoint = os.getenv("COSMOS_ENDPOINT")
        self._key = os.getenv("COSMOS_KEY")
        self._database_name = os.getenv("COSMOS_DATABASE_NAME")
        self._container_name = container_name

        if not all([self._endpoint, self._database_name, self._container_name]):
            raise ValueError("Missing required Cosmos DB configuration")

        self._initialize_client()
        self._initialize_database_and_container()

    async def get_all_items(self, limit: int = 100) -> list[dict[str, Any]]:
        query = "SELECT * FROM c"
        return await self._query_items(query, limit=limit, enable_cross_partition=True)

    def _initialize_client(self):
        try:
            if self._key:
                self.client = CosmosClient(self._endpoint, self._key)
                logger.info("Cosmos DB client initialized with key")
            else:
                credential = DefaultAzureCredential()
                self.client = CosmosClient(self._endpoint, credential=credential)
                logger.info("Cosmos DB client initialized with Azure Identity")
        except Exception as e:
            msg = f"Failed to initialize Cosmos DB client: {e}"
            logger.error(msg)
            raise Exception(msg)

    def _initialize_database_and_container(self):
        try:
            self.database = self.client.create_database_if_not_exists(
                id=self._database_name
            )
            logger.info(f"Database '{self._database_name}' ready")

            self.container = self.database.create_container_if_not_exists(
                id=self._container_name,
                partition_key=PartitionKey(path="/category"),
                offer_throughput=400,
            )
            logger.info(f"Container '{self._container_name}' ready")
        except exceptions.CosmosHttpResponseError as e:
            msg = f"Failed to create or access database: {e}"
            logger.error(msg)
            raise Exception(msg)

    async def _query_items(self,
                     query: str,
                     parameters: list[dict[str, Any]] | None = None,
                     partition_key: str | None = None,
                     limit: int = 100,
                     enable_cross_partition: bool = False,
                     ) -> list[dict[str, Any]] | None:
        try:
            query_kwargs = {
                "query": query,
                "max_item_count": limit,
            }

            if parameters:
                query_kwargs["parameters"] = parameters
            if partition_key:
                query_kwargs["partition_key"] = partition_key
            elif enable_cross_partition:
                query_kwargs["enable_cross_partition_query"] = True

            return list(self.container.query_items(**query_kwargs))
        except exceptions.CosmosHttpResponseError as e:
            msg = f"Failed to query items: {e}"
            logger.error(msg)
            raise Exception(msg)
