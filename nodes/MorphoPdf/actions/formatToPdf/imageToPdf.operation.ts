import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import {
  morphoPdfApiRequest,
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
  const inputMethod = this.getNodeParameter('inputMethod', itemIndex, 'url') as string;
  const outputType = this.getNodeParameter('outputType', itemIndex, 'url') as 'binary' | 'url';

  // Get PDF options
  const pageSize = this.getNodeParameter('pageSize', itemIndex, 'A4') as string;
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
    // Binary-based image to PDF - collect files from comma-separated binary property names
    const binaryPropertyNamesParam = this.getNodeParameter('binaryPropertyNames', itemIndex, 'data') as string;
    
    // Parse comma-separated property names
    const propertyNames = binaryPropertyNamesParam
      .split(',')
      .map((name) => name.trim())
      .filter((name) => name.length > 0);
    
    if (propertyNames.length === 0) {
      throw new Error('At least one binary property name is required');
    }
    
    // Collect files from each specified property name
    const files: Array<{ content: Buffer; fileName: string; mimeType: string }> = [];
    const items = this.getInputData();
    
    for (const propertyName of propertyNames) {
      for (let i = 0; i < items.length; i++) {
        try {
          const binaryData = this.helpers.assertBinaryData(i, propertyName);
          const buffer = await this.helpers.getBinaryDataBuffer(i, propertyName);
          files.push({
            content: buffer,
            fileName: binaryData.fileName || `image${files.length + 1}`,
            mimeType: binaryData.mimeType || 'image/jpeg',
          });
        } catch {
          // Skip items without this binary property
          continue;
        }
      }
    }

    if (files.length === 0) {
      throw new Error('At least one image is required');
    }

    const formData: Record<string, unknown> = {
      pageSize,
    };

    // Only include background is not 'OriginalColor when pageSize'
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
