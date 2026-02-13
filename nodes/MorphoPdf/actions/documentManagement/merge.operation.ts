import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
  getMultipleInputFiles,
  prepareOutput,
} from '../../shared/helpers';

/**
 * Normalize URL array from n8n's multipleValues parameter
 * Handles various formats: string, array of strings, nested arrays
 */
function normalizeUrls(urlsParam: unknown): string[] {
  if (!urlsParam) return [];

  // If it's a string, split by comma or newline
  if (typeof urlsParam === 'string') {
    return urlsParam
      .split(/[,\n]/)
      .map((url) => url.trim())
      .filter((url) => url.length > 0);
  }

  // If it's an array, flatten and filter
  if (Array.isArray(urlsParam)) {
    return urlsParam
      .flat()
      .map((url) => (typeof url === 'string' ? url.trim() : String(url).trim()))
      .filter((url) => url.length > 0);
  }

  return [];
}

export async function executeMerge(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', 0, 'url') as string;
  const outputType = this.getNodeParameter('outputType', 0, 'url') as 'binary' | 'url';

  let response: Buffer | object;

  if (inputMethod === 'url') {
    // URL-based merge
    const urlsParam = this.getNodeParameter('fileUrls', 0);
    const urls = normalizeUrls(urlsParam);

    if (urls.length < 2) {
      throw new Error(`At least 2 URLs are required for merging. Received ${urls.length} URL(s).`);
    }

    const body = { urls };
    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/merge',
      body,
      undefined,
      undefined,
      outputType,
    );
  } else {
    // Binary-based merge - collect all input files
    const files = await getMultipleInputFiles.call(this, items);

    if (files.length < 2) {
      throw new Error('At least 2 PDF files are required for merging');
    }

    // Build multipart form data
    const formData: Record<string, unknown> = {};
    files.forEach((file, index) => {
      formData[`file${index}`] = {
        value: file.content,
        options: {
          filename: file.fileName,
          contentType: file.mimeType,
        },
      };
    });

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/pdf/merge',
      undefined,
      formData,
      undefined,
      outputType,
    );
  }

  return prepareOutput.call(this, 0, response, 'merged.pdf', 'application/pdf', outputType);
}
