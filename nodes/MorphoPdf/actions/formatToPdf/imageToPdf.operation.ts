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

export async function executeImageToPdf(
  this: IExecuteFunctions,
  itemIndex: number,
): Promise<INodeExecutionData> {
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'url') as 'binary' | 'url';

  // Get PDF options
  const pageSize = this.getNodeParameter('imageToPdfPageSize', itemIndex, 'A4') as string;
  const margin = this.getNodeParameter('imageToPdfMargin', itemIndex, 36) as number;
  const backgroundColor = this.getNodeParameter('backgroundColor', itemIndex, '#FFFFFF') as string;

  let response: Buffer | object;

  if (inputMethod === 'url') {
    const urlsParam = this.getNodeParameter('imageFileUrls', itemIndex);
    const fileUrls = normalizeUrls(urlsParam);

    if (fileUrls.length === 0) {
      throw new Error('At least one image URL is required');
    }

    const body: Record<string, unknown> = {
      urls: fileUrls,
      pageSize,
      margin,
    };

    // Only include backgroundColor when pageSize is not 'Original'
    if (pageSize !== 'Original') {
      body.backgroundColor = backgroundColor;
    }

    response = await morphoPdfApiRequest.call(
      this,
      'POST',
      '/convert/image-to-pdf',
      body,
      undefined,
      undefined,
      outputType,
    );
  } else {
    // Get all input items for batch image processing
    const items = this.getInputData();
    const files = await getMultipleInputFiles.call(this, items);

    if (files.length === 0) {
      throw new Error('At least one image is required');
    }

    const formData: Record<string, unknown> = {
      pageSize,
      margin: margin.toString(),
    };

    // Only include backgroundColor when pageSize is not 'Original'
    if (pageSize !== 'Original') {
      formData.backgroundColor = backgroundColor;
    }

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
      '/convert/image-to-pdf',
      undefined,
      formData,
      undefined,
      outputType,
    );
  }

  return prepareOutput.call(
    this,
    itemIndex,
    response,
    'images.pdf',
    'application/pdf',
    outputType,
  );
}
