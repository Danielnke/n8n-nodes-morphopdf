import type {
  IExecuteFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  INodeExecutionData,
  IBinaryData,
} from 'n8n-workflow';
import FormData from 'form-data';
import type { InputFile } from './types';
import { handleApiError } from './errors';

const API_BASE_URL = 'https://api.morphopdf.com/v1';

/**
 * Make an authenticated request to the MorphoPDF API
 */
export async function morphoPdfApiRequest(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: object,
  formData?: Record<string, unknown>,
  qs?: Record<string, string | number>,
): Promise<Buffer | object> {
  const options: IHttpRequestOptions = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    qs: { format: 'binary', ...qs },
    returnFullResponse: true,
    encoding: 'arraybuffer',
    json: false,
  };

  if (formData) {
    // Build proper multipart form data using form-data package
    // This ensures the Content-Type header includes the boundary parameter
    const form = new FormData();
    for (const [key, fieldData] of Object.entries(formData)) {
      if (typeof fieldData === 'object' && fieldData !== null && 'value' in fieldData) {
        // Handle file fields with { value, options } format
        const fileField = fieldData as { value: Buffer; options?: { filename?: string; contentType?: string } };
        // Convert numbered file fields (file0, file1, etc.) to 'files' for backend compatibility
        // The backend's parseRequest expects 'file' for single files and 'files' for multiple
        const effectiveKey = /^file\d+$/.test(key) ? 'files' : key;
        form.append(effectiveKey, fileField.value, fileField.options);
      } else if (Array.isArray(fieldData)) {
        // Handle arrays (e.g., multiple files passed as array)
        for (const item of fieldData) {
          if (typeof item === 'object' && item !== null && 'value' in item) {
            const fileField = item as { value: Buffer; options?: { filename?: string; contentType?: string } };
            form.append(key, fileField.value, fileField.options);
          } else {
            form.append(key, String(item));
          }
        }
      } else {
        // Handle regular string/number fields
        form.append(key, String(fieldData));
      }
    }
    options.body = form;
    // Get headers with proper Content-Type including boundary
    options.headers = form.getHeaders();
  } else if (body) {
    options.body = body;
    options.headers = {
      'Content-Type': 'application/json',
    };
    options.json = true;
  }

  try {
    const response = await this.helpers.httpRequestWithAuthentication.call(
      this,
      'morphoPdfApi',
      options,
    );

    // Check if response is binary or JSON
    const contentType = response.headers?.['content-type'] as string | undefined;
    if (
      contentType?.includes('application/pdf') ||
      contentType?.includes('application/zip') ||
      contentType?.includes('image/') ||
      contentType?.includes('application/vnd.openxmlformats')
    ) {
      return Buffer.from(response.body as ArrayBuffer);
    }

    // Parse JSON response
    if (typeof response.body === 'string') {
      try {
        return JSON.parse(response.body);
      } catch {
        return { raw: response.body };
      }
    }

    return response.body as object;
  } catch (error) {
    handleApiError(error);
  }
}

/**
 * Extract input file from binary data or prepare URL request
 */
export async function getInputFile(
  this: IExecuteFunctions,
  itemIndex: number,
  forcedInputMethod?: string,
): Promise<InputFile> {
  // If forcedInputMethod is provided (e.g. for HTML/Markdown), use it
  // Otherwise try to get 'inputMethod' parameter, defaulting to 'binary' if not found
  let inputMethod = forcedInputMethod;
  if (!inputMethod) {
    try {
      inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
    } catch {
      inputMethod = 'binary';
    }
  }

  if (inputMethod === 'binary') {
    const binaryPropertyName = this.getNodeParameter(
      'binaryPropertyName',
      itemIndex,
      'data',
    ) as string;
    const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
    const buffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);

    return {
      content: buffer,
      fileName: binaryData.fileName || 'file.pdf',
      mimeType: binaryData.mimeType || 'application/pdf',
    };
  }

  // URL method - return empty content, API will fetch from URL
  const fileUrl = this.getNodeParameter('fileUrl', itemIndex) as string;
  return {
    content: Buffer.from(''),
    fileName: extractFilenameFromUrl(fileUrl),
    mimeType: 'application/pdf',
  };
}

/**
 * Get multiple input files for merge operations
 */
export async function getMultipleInputFiles(
  this: IExecuteFunctions,
  items: INodeExecutionData[],
): Promise<InputFile[]> {
  const files: InputFile[] = [];
  const binaryPropertyName = this.getNodeParameter('binaryPropertyName', 0, 'data') as string;

  for (let i = 0; i < items.length; i++) {
    try {
      const binaryData = this.helpers.assertBinaryData(i, binaryPropertyName);
      const buffer = await this.helpers.getBinaryDataBuffer(i, binaryPropertyName);

      files.push({
        content: buffer,
        fileName: binaryData.fileName || `file${i + 1}.pdf`,
        mimeType: binaryData.mimeType || 'application/pdf',
      });
    } catch {
      // Skip items without binary data
      continue;
    }
  }

  return files;
}

/**
 * Prepare binary output data for n8n
 */
export async function prepareBinaryOutput(
  this: IExecuteFunctions,
  itemIndex: number,
  buffer: Buffer,
  fileName: string,
  mimeType: string,
): Promise<INodeExecutionData> {
  const outputPropertyName = this.getNodeParameter(
    'outputBinaryPropertyName',
    itemIndex,
    'data',
  ) as string;

  const binaryData: IBinaryData = await this.helpers.prepareBinaryData(
    buffer,
    fileName,
    mimeType,
  );

  return {
    json: {
      success: true,
      fileName,
      fileSize: buffer.length,
    },
    binary: {
      [outputPropertyName]: binaryData,
    },
    pairedItem: { item: itemIndex },
  };
}

/**
 * Extract filename from URL
 */
export function extractFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop();
    return filename || 'document.pdf';
  } catch {
    return 'document.pdf';
  }
}

/**
 * Get output filename based on operation
 */
export function getOutputFilename(operation: string, inputFilename?: string): string {
  const baseName = inputFilename?.replace(/\.[^/.]+$/, '') || 'document';

  const operationSuffixes: Record<string, string> = {
    merge: 'merged.pdf',
    split: 'split.zip',
    compress: `${baseName}_compressed.pdf`,
    rotate: `${baseName}_rotated.pdf`,
    crop: `${baseName}_cropped.pdf`,
    organize: `${baseName}_organized.pdf`,
    edit: `${baseName}_edited.pdf`,
    watermark: `${baseName}_watermarked.pdf`,
    sign: `${baseName}_signed.pdf`,
    protect: `${baseName}_protected.pdf`,
    unlock: `${baseName}_unlocked.pdf`,
    pdfToWord: `${baseName}.docx`,
    pdfToExcel: `${baseName}.xlsx`,
    pdfToPowerpoint: `${baseName}.pptx`,
    pdfToImage: `${baseName}.png`,
    wordToPdf: `${baseName}.pdf`,
    excelToPdf: `${baseName}.pdf`,
    powerpointToPdf: `${baseName}.pdf`,
    imageToPdf: 'images.pdf',
    htmlToPdf: 'webpage.pdf',
    markdownToPdf: `${baseName}.pdf`,
  };

  return operationSuffixes[operation] || `${baseName}_output.pdf`;
}

/**
 * Get MIME type for output based on operation
 */
export function getOutputMimeType(operation: string): string {
  const mimeTypes: Record<string, string> = {
    pdfToWord: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pdfToExcel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    pdfToPowerpoint: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    pdfToImage: 'image/png',
    split: 'application/zip',
  };

  return mimeTypes[operation] || 'application/pdf';
}
