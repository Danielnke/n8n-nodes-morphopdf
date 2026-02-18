import type {
  IExecuteFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  INodeExecutionData,
  IBinaryData,
} from 'n8n-workflow';
import type { InputFile } from './types';
import { handleApiError } from './errors';

const API_BASE_URL = 'https://api.morphopdf.com/v1';

/**
 * Generate a random boundary string for multipart form data
 */
function generateBoundary(): string {
  return '----n8nFormBoundary' + Math.random().toString(36).substring(2);
}

/**
 * Build a multipart form data body manually without external dependencies
 * This is required for n8n Cloud compatibility (form-data package is not allowed)
 */
function buildMultipartBody(
  formData: Record<string, unknown>,
  boundary: string,
): Buffer {
  const parts: Buffer[] = [];
  const CRLF = '\r\n';

  for (const [key, fieldData] of Object.entries(formData)) {
    if (typeof fieldData === 'object' && fieldData !== null && 'value' in fieldData) {
      // Handle file fields with { value, options } format
      const fileField = fieldData as { value: Buffer; options?: { filename?: string; contentType?: string } };
      // Convert numbered file fields (file0, file1, etc.) to 'files' for backend compatibility
      const effectiveKey = /^file\d+$/.test(key) ? 'files' : key;
      const filename = fileField.options?.filename || 'file';
      const contentType = fileField.options?.contentType || 'application/octet-stream';

      const header = `--${boundary}${CRLF}` +
        `Content-Disposition: form-data; name="${effectiveKey}"; filename="${filename}"${CRLF}` +
        `Content-Type: ${contentType}${CRLF}${CRLF}`;

      parts.push(Buffer.from(header, 'utf-8'));
      parts.push(fileField.value);
      parts.push(Buffer.from(CRLF, 'utf-8'));
    } else if (Array.isArray(fieldData)) {
      // Handle arrays (e.g., multiple files passed as array)
      for (const item of fieldData) {
        if (typeof item === 'object' && item !== null && 'value' in item) {
          const fileField = item as { value: Buffer; options?: { filename?: string; contentType?: string } };
          const filename = fileField.options?.filename || 'file';
          const contentType = fileField.options?.contentType || 'application/octet-stream';

          const header = `--${boundary}${CRLF}` +
            `Content-Disposition: form-data; name="${key}"; filename="${filename}"${CRLF}` +
            `Content-Type: ${contentType}${CRLF}${CRLF}`;

          parts.push(Buffer.from(header, 'utf-8'));
          parts.push(fileField.value);
          parts.push(Buffer.from(CRLF, 'utf-8'));
        } else {
          const header = `--${boundary}${CRLF}` +
            `Content-Disposition: form-data; name="${key}"${CRLF}${CRLF}`;
          parts.push(Buffer.from(header + String(item) + CRLF, 'utf-8'));
        }
      }
    } else {
      // Handle regular string/number fields
      const header = `--${boundary}${CRLF}` +
        `Content-Disposition: form-data; name="${key}"${CRLF}${CRLF}`;
      parts.push(Buffer.from(header + String(fieldData) + CRLF, 'utf-8'));
    }
  }

  // Add closing boundary
  parts.push(Buffer.from(`--${boundary}--${CRLF}`, 'utf-8'));

  return Buffer.concat(parts);
}

/**
 * Make an authenticated request to the MorphoPDF API
 * @param outputType - 'binary' returns raw file, 'url' returns JSON with downloadUrl
 */
export async function morphoPdfApiRequest(
  this: IExecuteFunctions,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: object,
  formData?: Record<string, unknown>,
  qs?: Record<string, string | number>,
  outputType: 'binary' | 'url' = 'binary',
): Promise<Buffer | object> {
  // Build query string based on output type
  const queryString: Record<string, string | number> = { ...qs };
  if (outputType === 'binary') {
    queryString.format = 'binary';
  }
  // For 'url' mode, don't set format param - API returns JSON with downloadUrl

  const options: IHttpRequestOptions = {
    method,
    url: `${API_BASE_URL}${endpoint}`,
    qs: queryString,
    returnFullResponse: true,
    encoding: outputType === 'binary' ? 'arraybuffer' : undefined,
    json: outputType === 'url',
  };

  if (formData) {
    // Build multipart form data manually (n8n Cloud doesn't allow form-data package)
    const boundary = generateBoundary();
    const multipartBody = buildMultipartBody(formData, boundary);

    options.body = multipartBody;
    options.headers = {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': String(multipartBody.length),
    };
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

    // For URL mode, return the JSON response directly
    if (outputType === 'url') {
      if (typeof response.body === 'string') {
        try {
          return JSON.parse(response.body);
        } catch {
          return { raw: response.body };
        }
      }
      return response.body as object;
    }

    // For binary mode, check content type and return buffer
    const contentType = response.headers?.['content-type'] as string | undefined;
    if (
      contentType?.includes('application/pdf') ||
      contentType?.includes('application/zip') ||
      contentType?.includes('image/') ||
      contentType?.includes('application/vnd.openxmlformats')
    ) {
      return Buffer.from(response.body as ArrayBuffer);
    }

    // Parse JSON response (for error handling)
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
  // Otherwise try to get 'inputMethod' parameter, defaulting to 'url' if not found
  let inputMethod = forcedInputMethod;
  if (!inputMethod) {
    try {
      inputMethod = this.getNodeParameter('inputMethod', itemIndex) as string;
    } catch {
      inputMethod = 'url';
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
 * Unified output handler that supports both binary and URL output types
 * @param response - Either a Buffer (binary) or API response object (URL mode)
 * @param outputType - 'binary' or 'url'
 */
export async function prepareOutput(
  this: IExecuteFunctions,
  itemIndex: number,
  response: Buffer | object,
  fileName: string,
  mimeType: string,
  outputType: 'binary' | 'url' = 'binary',
): Promise<INodeExecutionData> {
  if (outputType === 'url') {
    // URL mode - extract downloadUrl from API JSON response
    // API returns flat structure: { success, downloadUrl, fileName, ... }
    const apiResponse = response as {
      success?: boolean;
      downloadUrl?: string;
      fileName?: string;
      outputSize?: number;
    };

    if (!apiResponse.success || !apiResponse.downloadUrl) {
      throw new Error('API did not return a valid download URL');
    }

    const baseUrl = 'https://api.morphopdf.com';
    const downloadUrl = apiResponse.downloadUrl.startsWith('http')
      ? apiResponse.downloadUrl
      : `${baseUrl}${apiResponse.downloadUrl}`;

    return {
      json: {
        success: true,
        outputType: 'url',
        fileName: apiResponse.fileName || fileName,
        fileSize: apiResponse.outputSize,
        downloadUrl,
        expiresIn: '1 hour',
      },
      pairedItem: { item: itemIndex },
    };
  }

  // Binary mode - use existing binary output preparation
  return prepareBinaryOutput.call(this, itemIndex, response as Buffer, fileName, mimeType);
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
