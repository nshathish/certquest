import * as path from 'path';
import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from '@azure/functions';

import { BlobServiceClient } from '@azure/storage-blob';

import { v4 as uuidv4 } from 'uuid';

export async function uploadImage(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);

  const connectionString = process.env.RAW_IMAGE_STORAGE;
  const containerName = process.env.BLOB_CONTAINER_NAME ?? 'certquestrawimages';

  if (!connectionString) {
    return {
      status: 500,
      jsonBody: { error: 'Storage connection string not configured' },
    };
  }

  const contentType = request.headers.get('content-type');

  if (!contentType?.includes('multipart/form-data')) {
    return {
      status: 400,
      jsonBody: {
        error: 'Content type must be multipart/form-data',
        contentType,
      },
    };
  }

  const formData = await request.formData();
  const file = formData.get('file');
  const category = formData.get('category');
  const tags = formData.get('tags');

  if (!file || !(file instanceof File)) {
    return {
      status: 400,
      jsonBody: { error: 'No file found in request' },
    };
  }

  const id = uuidv4();
  const blobName = `${id}_${file.name}`;
  const mimeType = file.type;
  const arrayBuffer = await file.arrayBuffer();

  const blobServiceClient =
    BlobServiceClient.fromConnectionString(connectionString);
  const containerClient = blobServiceClient.getContainerClient(containerName);

  await containerClient.createIfNotExists();

  const blockBlobClient = containerClient.getBlockBlobClient(blobName);

  await blockBlobClient.upload(arrayBuffer, arrayBuffer.byteLength, {
    blobHTTPHeaders: {
      blobContentType: mimeType,
    },
    metadata: {
      id,
      mimeType,
      category: category ? category.toString() : '',
      tags: JSON.stringify(tags),
    },
  });

  return {
    status: 200,
    jsonBody: {
      message: 'file uploaded successfully',
      name: blobName,
      size: file.size,
      id,
    },
  };
}

app.http('upload-image', {
  methods: ['POST'],
  authLevel: 'function',
  handler: uploadImage,
});
